"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Car, CarFormData } from "@/types/car";

export function useCars() {
  const supabase = createClient();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCars = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("cars")
      .select("id, brand, model, year, mileage, notes");

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setCars(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const saveCar = useCallback(
    async (formData: CarFormData, editingCar: Car | null) => {
      setError(null);

      const payload = {
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        notes: formData.notes.trim() || null,
      };

      if (
        !payload.brand ||
        !payload.model ||
        Number.isNaN(payload.year) ||
        Number.isNaN(payload.mileage)
      ) {
        setError("Please provide valid brand, model, year, and mileage.");
        return false;
      }

      if (editingCar) {
        const { error: updateError } = await supabase
          .from("cars")
          .update(payload)
          .eq("id", editingCar.id);

        if (updateError) {
          setError(updateError.message);
          return false;
        }
      } else {
        const { error: insertError } = await supabase
          .from("cars")
          .insert(payload);

        if (insertError) {
          setError(insertError.message);
          return false;
        }
      }

      await loadCars();
      return true;
    },
    [supabase, loadCars]
  );

  const deleteCar = useCallback(
    async (carId: string) => {
      setError(null);

      const { error: deleteError } = await supabase
        .from("cars")
        .delete()
        .eq("id", carId);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      setCars((currentCars) => currentCars.filter((car) => car.id !== carId));
      return true;
    },
    [supabase]
  );

  return {
    cars,
    loading,
    error,
    setError,
    saveCar,
    deleteCar,
  };
}
