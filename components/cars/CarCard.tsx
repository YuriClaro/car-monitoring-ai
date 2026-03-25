"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Car } from "@/types/car";

interface CarCardProps {
  car: Car;
  onDetails: (car: Car) => void;
  onEdit: (car: Car) => void;
  onDelete: (carId: string) => void;
}

export function CarCard({ car, onDetails, onEdit, onDelete }: CarCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(`car-photo:${car.id}`);
    setImageUrl(saved);
  }, [car.id]);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    const imageDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Failed to read image"));
      reader.readAsDataURL(file);
    });

    window.localStorage.setItem(`car-photo:${car.id}`, imageDataUrl);
    setImageUrl(imageDataUrl);
    event.target.value = "";
  };

  const handleRemoveImage = () => {
    window.localStorage.removeItem(`car-photo:${car.id}`);
    setImageUrl(null);
  };

  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-40 w-full overflow-hidden rounded-t-xl border-b bg-muted/40">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`${car.brand} ${car.model} ${car.year}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            No photo uploaded
          </div>
        )}

        <label className="absolute bottom-2 left-2 cursor-pointer rounded-md bg-black/70 px-2 py-1 text-xs text-white">
          {imageUrl ? "Change photo" : "Add photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>

        {imageUrl ? (
          <button
            type="button"
            className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white"
            onClick={handleRemoveImage}
          >
            Remove
          </button>
        ) : null}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {car.brand} {car.model}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="flex items-center justify-between rounded-md border px-3 py-2">
          <span className="font-medium">Year</span>
          <span className="font-semibold">{car.year}</span>
        </p>
        <p className="flex items-center justify-between rounded-md border px-3 py-2">
          <span className="font-medium">Mileage</span>
          <span className="font-semibold">{car.mileage} mi</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Click Details to open the modal.
        </p>
      </CardContent>
      <CardFooter className="gap-2 pt-2">
        <Button variant="secondary" onClick={() => onDetails(car)}>
          Details
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Edit car"
          onClick={() => onEdit(car)}
        >
          <Pencil />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          aria-label="Delete car"
          onClick={() => onDelete(car.id)}
        >
          <Trash2 />
        </Button>
      </CardFooter>
    </Card>
  );
}
