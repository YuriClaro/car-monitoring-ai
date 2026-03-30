"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CarFilters,
  type CarFiltersState,
} from "@/components/cars/CarFilters";
import { CarForm } from "@/components/cars/CarForm";
import { CarDetails } from "@/components/cars/CarDetails";
import { CarList } from "@/components/cars/CarList";
import { ErrorAlert } from "@/components/cars/ErrorAlert";
import { useCars } from "@/lib/hooks/useCars";
import type { Car, CarFormData } from "@/types/car";

const emptyForm: CarFormData = {
  brand: "",
  model: "",
  year: "",
  mileage: "",
  notes: "",
};

const emptyFilters: CarFiltersState = {
  query: "",
  brand: "",
  model: "",
  yearMin: "",
  yearMax: "",
  mileageMin: "",
  mileageMax: "",
};

const toOptionalNumber = (value: string) => {
  if (!value) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export default function Home() {
  const { cars, loading, error, saveCar, deleteCar, reloadCars } = useCars();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState<CarFormData>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [startDetailsInEditMode, setStartDetailsInEditMode] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [carPendingDelete, setCarPendingDelete] = useState<Car | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filters, setFilters] = useState<CarFiltersState>(emptyFilters);

  const normalizedFilters = useMemo(
    () => ({
      query: filters.query.trim().toLowerCase(),
      brand: filters.brand.trim().toLowerCase(),
      model: filters.model.trim().toLowerCase(),
      yearMin: filters.yearMin.trim(),
      yearMax: filters.yearMax.trim(),
      mileageMin: filters.mileageMin.trim(),
      mileageMax: filters.mileageMax.trim(),
    }),
    [filters],
  );

  const hasActiveFilters = useMemo(
    () =>
      Object.values(normalizedFilters).some(
        (filterValue) => filterValue.length > 0,
      ),
    [normalizedFilters],
  );

  const filteredCars = useMemo(() => {
    const yearMin = toOptionalNumber(normalizedFilters.yearMin);
    const yearMax = toOptionalNumber(normalizedFilters.yearMax);
    const mileageMin = toOptionalNumber(normalizedFilters.mileageMin);
    const mileageMax = toOptionalNumber(normalizedFilters.mileageMax);

    return cars.filter((car) => {
      const carBrand = car.brand.toLowerCase();
      const carModel = car.model.toLowerCase();
      const carYear = String(car.year);
      const carMileage = String(car.mileage);

      const matchesQuery =
        !normalizedFilters.query ||
        carBrand.includes(normalizedFilters.query) ||
        carModel.includes(normalizedFilters.query) ||
        carYear.includes(normalizedFilters.query) ||
        carMileage.includes(normalizedFilters.query);

      const matchesBrand =
        !normalizedFilters.brand || carBrand.includes(normalizedFilters.brand);

      const matchesModel =
        !normalizedFilters.model || carModel.includes(normalizedFilters.model);

      const matchesYearMin = yearMin === null || car.year >= yearMin;
      const matchesYearMax = yearMax === null || car.year <= yearMax;

      const matchesMileageMin = mileageMin === null || car.mileage >= mileageMin;
      const matchesMileageMax = mileageMax === null || car.mileage <= mileageMax;

      return (
        matchesQuery &&
        matchesBrand &&
        matchesModel &&
        matchesYearMin &&
        matchesYearMax &&
        matchesMileageMin &&
        matchesMileageMax
      );
    });
  }, [cars, normalizedFilters]);

  const openCreateModal = () => {
    setEditingCar(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(emptyForm);
    setEditingCar(null);
  };

  const handleSubmit = async (photoFile: File | null) => {
    setIsSaving(true);

    const success = await saveCar(formData, editingCar, photoFile);

    if (success) {
      closeModal();
    }

    setIsSaving(false);
  };

  const requestDelete = (carId: string) => {
    const car = cars.find((currentCar) => currentCar.id === carId) ?? null;
    setCarPendingDelete(car);
  };

  const handleDelete = async () => {
    if (!carPendingDelete) {
      return;
    }

    setIsDeleting(true);
    const success = await deleteCar(carPendingDelete.id);

    if (success && selectedCar?.id === carPendingDelete.id) {
      closeDetailsModal();
    }

    if (success) {
      setCarPendingDelete(null);
    }

    setIsDeleting(false);
  };

  const closeDeleteModal = () => {
    if (isDeleting) {
      return;
    }

    setCarPendingDelete(null);
  };

  const openDetailsModal = (car: Car, startInEditMode = false) => {
    setSelectedCar(car);
    setStartDetailsInEditMode(startInEditMode);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setStartDetailsInEditMode(false);
    setSelectedCar(null);
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Cars</h1>
        <Button onClick={openCreateModal}>Add car</Button>
      </div>

      <ErrorAlert error={error} />

      <CarFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={() => setFilters(emptyFilters)}
      />

      <p className="mb-4 text-sm text-muted-foreground">
        Showing {filteredCars.length} of {cars.length} cars.
      </p>

      <CarList
        cars={filteredCars}
        isLoading={loading}
        emptyMessage={
          hasActiveFilters
            ? "No cars match the current filters."
            : "No cars registered yet."
        }
        onDetails={(car) => openDetailsModal(car, false)}
        onDelete={requestDelete}
      />

      <CarForm
        isOpen={isModalOpen}
        editingCar={editingCar}
        formData={formData}
        isSaving={isSaving}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={setFormData}
      />

      <CarDetails
        isOpen={isDetailsModalOpen}
        car={selectedCar}
        startInEditMode={startDetailsInEditMode}
        onClose={closeDetailsModal}
        onSave={async (car, formData) => saveCar(formData, car)}
        onCarUpdated={(carId, updates) => {
          if (selectedCar?.id === carId) {
            setSelectedCar((currentCar) =>
              currentCar ? { ...currentCar, ...updates } : currentCar,
            );
          }

          void reloadCars();
        }}
        onPhotoUpdated={(carId, photoPath) => {
          if (selectedCar?.id === carId) {
            setSelectedCar((currentCar) =>
              currentCar ? { ...currentCar, photo_path: photoPath } : currentCar,
            );
          }

          void reloadCars();
        }}
      />

      {carPendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-car-title"
          aria-describedby="delete-car-description"
          onClick={closeDeleteModal}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-background p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-car-title" className="text-lg font-semibold">
              You are about to delete {carPendingDelete.brand} {carPendingDelete.model} (
              {carPendingDelete.year})
            </h2>
            <p
              id="delete-car-description"
              className="mt-2 text-sm text-muted-foreground"
            >
              This action will permanently remove {carPendingDelete.brand} {carPendingDelete.model} (
              {carPendingDelete.year}) from the database.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Car"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
