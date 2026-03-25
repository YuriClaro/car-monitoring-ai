"use client";

import { CarCard } from "./CarCard";
import type { Car } from "@/types/car";

interface CarListProps {
  cars: Car[];
  isLoading: boolean;
  emptyMessage?: string;
  onDetails: (car: Car) => void;
  onEdit: (car: Car) => void;
  onDelete: (carId: string) => void;
}

export function CarList({
  cars,
  isLoading,
  emptyMessage = "No cars registered yet.",
  onDetails,
  onEdit,
  onDelete,
}: CarListProps) {
  if (isLoading) {
    return <p>Loading cars...</p>;
  }

  if (cars.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cars.map((car) => (
        <CarCard
          key={car.id}
          car={car}
          onDetails={onDetails}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
