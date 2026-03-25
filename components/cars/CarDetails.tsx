"use client";

import { Button } from "@/components/ui/button";
import type { Car } from "@/types/car";

interface CarDetailsProps {
  isOpen: boolean;
  car: Car | null;
  onClose: () => void;
}

export function CarDetails({ isOpen, car, onClose }: CarDetailsProps) {
  if (!isOpen || !car) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Car details</h2>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Brand:</span> {car.brand}
          </p>
          <p>
            <span className="font-medium">Model:</span> {car.model}
          </p>
          <p>
            <span className="font-medium">Year:</span> {car.year}
          </p>
          <p>
            <span className="font-medium">Mileage:</span> {car.mileage}
          </p>
          <p>
            <span className="font-medium">Notes:</span> {car.notes || "-"}
          </p>
          <p className="break-all text-xs text-muted-foreground">
            <span className="font-medium">ID:</span> {car.id}
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
