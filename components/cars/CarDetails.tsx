"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Calendar, CarFront, FileText, Gauge, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Car, CarFormData } from "@/types/car";
import { useCarPhotoManager } from "./useCarPhotoManager";

interface CarDetailsProps {
  isOpen: boolean;
  car: Car | null;
  startInEditMode?: boolean;
  onClose: () => void;
  onSave: (car: Car, formData: CarFormData) => Promise<boolean>;
  onCarUpdated: (carId: string, updates: Partial<Car>) => void;
  onPhotoUpdated: (carId: string, photoPath: string | null) => void;
}

export function CarDetails({
  isOpen,
  car,
  startInEditMode = false,
  onClose,
  onSave,
  onCarUpdated,
  onPhotoUpdated,
}: CarDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CarFormData>({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    notes: "",
  });

  const {
    imageUrl,
    isUploading,
    uploadError,
    setUploadError,
    handleImageUpload,
    handleRemoveImage,
  } = useCarPhotoManager({ car, onPhotoUpdated });

  const title = useMemo(() => {
    if (!car) return "";
    return `${car.brand} ${car.model}`;
  }, [car]);

  useEffect(() => {
    setIsEditing(startInEditMode);
    setIsSaving(false);
    setFormData({
      brand: car?.brand ?? "",
      model: car?.model ?? "",
      year: car ? String(car.year) : "",
      mileage: car ? String(car.mileage) : "",
      notes: car?.notes ?? "",
    });
  }, [car, startInEditMode]);

  const handleSave = async () => {
    if (!car) {
      return;
    }

    setIsSaving(true);
    setUploadError(null);

    const success = await onSave(car, formData);

    if (success) {
      const year = Number(formData.year);
      const mileage = Number(formData.mileage);

      onCarUpdated(car.id, {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: Number.isFinite(year) ? year : car.year,
        mileage: Number.isFinite(mileage) ? mileage : car.mileage,
        notes: formData.notes.trim() || null,
      });
      setIsEditing(false);
    }

    setIsSaving(false);
  };

  const handleBackdropClick = () => {
    if (isEditing) {
      return;
    }

    onClose();
  };

  if (!isOpen || !car) return null;

  const detailsFields: Array<{
    key: string;
    label: string;
    icon: ReactNode;
    content: ReactNode;
  }> = [
    {
      key: "brand",
      label: "Brand",
      icon: <CarFront size={14} />,
      content: isEditing ? (
        <Input
          value={formData.brand}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, brand: event.target.value }))
          }
        />
      ) : (
        <p className="text-sm font-medium">{car.brand}</p>
      ),
    },
    {
      key: "model",
      label: "Model",
      icon: <CarFront size={14} />,
      content: isEditing ? (
        <Input
          value={formData.model}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, model: event.target.value }))
          }
        />
      ) : (
        <p className="text-sm font-medium">{car.model}</p>
      ),
    },
    {
      key: "year",
      label: "Year",
      icon: <Calendar size={14} />,
      content: isEditing ? (
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formData.year}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, year: event.target.value }))
          }
        />
      ) : (
        <p className="text-sm font-medium">{car.year}</p>
      ),
    },
    {
      key: "mileage",
      label: "Mileage",
      icon: <Gauge size={14} />,
      content: isEditing ? (
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formData.mileage}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, mileage: event.target.value }))
          }
        />
      ) : (
        <p className="text-sm font-medium">
          {new Intl.NumberFormat("pt-BR").format(car.mileage)} km
        </p>
      ),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border bg-background shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative h-52 w-full border-b bg-muted/40">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${title} photo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-muted-foreground">
              <CarFront size={18} />
              No photo available
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4">
            <p className="text-lg font-semibold text-white">{title}</p>
          </div>

          <div className="absolute right-3 top-3 flex gap-2">
            <label className="cursor-pointer rounded-md bg-black/70 px-2 py-1 text-xs text-white">
              {imageUrl ? "Change photo" : "Add photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
            {imageUrl ? (
              <button
                type="button"
                className="rounded-md bg-black/70 px-2 py-1 text-xs text-white"
                onClick={handleRemoveImage}
                disabled={isUploading}
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>

        {uploadError ? (
          <div className="border-b border-red-400/40 bg-red-950/20 px-5 py-2 text-xs text-red-300">
            {uploadError}
          </div>
        ) : null}

        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {detailsFields.map((field) => (
            <div key={field.key} className="rounded-lg border bg-card p-3">
              <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                {field.icon} {field.label}
              </p>
              {field.content}
            </div>
          ))}

          <div className="rounded-lg border bg-card p-3 sm:col-span-2">
            <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <FileText size={14} /> Notes
            </p>
            {isEditing ? (
              <textarea
                value={formData.notes}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, notes: event.target.value }))
                }
                className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            ) : (
              <p className="text-sm">{car.notes?.trim() ? car.notes : "No notes"}</p>
            )}
          </div>

          <p className="break-all text-xs text-muted-foreground sm:col-span-2">
            ID: {car.id}
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t p-4">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    brand: car.brand,
                    model: car.model,
                    year: String(car.year),
                    mileage: String(car.mileage),
                    notes: car.notes ?? "",
                  });
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={isSaving || isUploading}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </>
          ) : (
            <Button type="button" variant="secondary" onClick={() => setIsEditing(true)}>
              <Pencil size={14} />
              Edit
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
