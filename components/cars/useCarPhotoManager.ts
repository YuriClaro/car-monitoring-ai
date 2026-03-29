"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Car } from "@/types/car";

type UseCarPhotoManagerArgs = {
  car: Car | null;
  onPhotoUpdated: (carId: string, photoPath: string | null) => void;
};

export function useCarPhotoManager({ car, onPhotoUpdated }: UseCarPhotoManagerArgs) {
  const supabase = createClient();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setPhotoPath(car?.photo_path ?? null);

    if (!car?.photo_path) {
      setImageUrl(null);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("car-photos").getPublicUrl(car.photo_path);

    setImageUrl(publicUrl);
  }, [car, supabase]);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!car) {
      return;
    }

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

      if (photoPath) {
        const { error: removeOldError } = await supabase.storage
          .from("car-photos")
          .remove([photoPath]);

        if (removeOldError) {
          setUploadError("Failed to remove old photo.");
          event.target.value = "";
          return;
        }
      }

      const { error: uploadErr } = await supabase.storage
        .from("car-photos")
        .upload(newPhotoPath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadErr) {
        setUploadError(`Upload failed: ${uploadErr.message}`);
        event.target.value = "";
        return;
      }

      const { error: updateErr } = await supabase
        .from("cars")
        .update({ photo_path: newPhotoPath })
        .eq("id", car.id);

      if (updateErr) {
        await supabase.storage.from("car-photos").remove([newPhotoPath]);
        setUploadError(`Failed to save photo reference: ${updateErr.message}`);
        event.target.value = "";
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("car-photos").getPublicUrl(newPhotoPath);

      setPhotoPath(newPhotoPath);
      setImageUrl(`${publicUrl}?t=${Date.now()}`);
      onPhotoUpdated(car.id, newPhotoPath);
    } catch (error) {
      console.error("Unexpected error during upload:", error);
      setUploadError("An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveImage = async () => {
    if (!car || !photoPath) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const { error: removeError } = await supabase.storage
        .from("car-photos")
        .remove([photoPath]);

      if (removeError) {
        setUploadError(removeError.message);
        return;
      }

      const { error: updateError } = await supabase
        .from("cars")
        .update({ photo_path: null })
        .eq("id", car.id);

      if (updateError) {
        setUploadError(updateError.message);
        return;
      }

      setPhotoPath(null);
      setImageUrl(null);
      onPhotoUpdated(car.id, null);
    } finally {
      setIsUploading(false);
    }
  };

  return {
    imageUrl,
    isUploading,
    uploadError,
    setUploadError,
    handleImageUpload,
    handleRemoveImage,
  };
}
