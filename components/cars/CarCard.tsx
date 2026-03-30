"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Car } from "@/types/car";

interface CarCardProps {
  car: Car;
  onDetails: (car: Car) => void;
  onDelete: (carId: string) => void;
}

export function CarCard({ car, onDetails, onDelete }: CarCardProps) {
  const supabase = createClient();
  const storageBucket = "car-photos";
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!car.photo_path) {
      setImageUrl(null);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(storageBucket).getPublicUrl(car.photo_path);

    setImageUrl(publicUrl);
  }, [car.photo_path, supabase]);

  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        className="relative h-40 w-full overflow-hidden rounded-t-xl border-b bg-muted/40 text-left"
        onClick={() => onDetails(car)}
        aria-label={`Open details for ${car.brand} ${car.model} ${car.year}`}
      >
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
      </button>

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
      </CardContent>
      <CardFooter className="gap-2 pt-2">
        <Button variant="secondary" onClick={() => onDetails(car)}>
          Details
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
