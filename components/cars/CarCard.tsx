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
import { createClient } from "@/lib/supabase/client";
import type { Car } from "@/types/car";

interface CarCardProps {
  car: Car;
  onDetails: (car: Car) => void;
  onEdit: (car: Car) => void;
  onDelete: (carId: string) => void;
}

export function CarCard({ car, onDetails, onEdit, onDelete }: CarCardProps) {
  const supabase = createClient();
  const storageBucket = "car-photos";
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(car.photo_path);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setPhotoPath(car.photo_path);
  }, [car.photo_path]);

  useEffect(() => {
    if (!photoPath) {
      setImageUrl(null);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(storageBucket).getPublicUrl(photoPath);

    setImageUrl(publicUrl);
  }, [photoPath, supabase]);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const safeExtension = fileExtension.replace(/[^a-z0-9]/g, "") || "jpg";
      const newPhotoPath = `${car.id}/${Date.now()}.${safeExtension}`;

      console.log("Starting upload of file:", file.name, "to path:", newPhotoPath);

      if (photoPath) {
        console.log("Removing old photo:", photoPath);
        const { error: removeOldError } = await supabase.storage
          .from(storageBucket)
          .remove([photoPath]);

        if (removeOldError) {
          console.error("Error removing old photo:", removeOldError);
          setUploadError("Failed to remove old photo.");
          setIsUploading(false);
          event.target.value = "";
          return;
        }
      }

      console.log("Uploading file to storage...");
      const { error: uploadErr, data } = await supabase.storage
        .from(storageBucket)
        .upload(newPhotoPath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadErr) {
        console.error("Upload error:", uploadErr);
        setUploadError(`Upload failed: ${uploadErr.message}`);
        setIsUploading(false);
        event.target.value = "";
        return;
      }

      console.log("File uploaded successfully:", data);

      console.log("Updating car record with photo_path...");
      const { error: updateErr } = await supabase
        .from("cars")
        .update({ photo_path: newPhotoPath })
        .eq("id", car.id);

      if (updateErr) {
        console.error("Update error:", updateErr);
        await supabase.storage.from(storageBucket).remove([newPhotoPath]);
        setUploadError(`Failed to save photo reference: ${updateErr.message}`);
        setIsUploading(false);
        event.target.value = "";
        return;
      }

      console.log("Car record updated successfully");

      const {
        data: { publicUrl },
      } = supabase.storage.from(storageBucket).getPublicUrl(newPhotoPath);

      console.log("Generated public URL:", publicUrl);

      setPhotoPath(newPhotoPath);
      setImageUrl(`${publicUrl}?t=${Date.now()}`);
      setUploadError(null);
    } catch (error) {
      console.error("Unexpected error during upload:", error);
      setUploadError("An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = async () => {
    if (!photoPath) {
      return;
    }

    const { error: removeError } = await supabase.storage
      .from(storageBucket)
      .remove([photoPath]);

    if (removeError) {
      return;
    }

    const { error: updateError } = await supabase
      .from("cars")
      .update({ photo_path: null })
      .eq("id", car.id);

    if (updateError) {
      return;
    }

    setPhotoPath(null);
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
            {isUploading ? "Uploading..." : "No photo uploaded"}
          </div>
        )}

        {uploadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/90 p-2">
            <p className="text-center text-xs text-white">{uploadError}</p>
          </div>
        )}

        <label className="absolute bottom-2 left-2 cursor-pointer rounded-md bg-black/70 px-2 py-1 text-xs text-white">
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
            className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white"
            onClick={handleRemoveImage}
            disabled={isUploading}
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
