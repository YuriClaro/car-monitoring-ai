"use client";

import { FormEvent, useEffect, useState } from "react";
import { CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Car, CarFormData } from "@/types/car";

const emptyForm: CarFormData = {
  brand: "",
  model: "",
  year: "",
  mileage: "",
  notes: "",
};

interface CarFormProps {
  isOpen: boolean;
  editingCar: Car | null;
  formData: CarFormData;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (photoFile: File | null) => Promise<void>;
  onFormChange: (data: CarFormData) => void;
}

export function CarForm({
  isOpen,
  editingCar,
  formData,
  isSaving,
  onClose,
  onSubmit,
  onFormChange,
}: CarFormProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setPhotoFile(null);
    setPhotoPreview(null);
  }, [isOpen, editingCar]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(photoFile);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-xl border bg-background shadow-xl">
        <div className="relative h-48 w-full border-b bg-muted/40">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Selected car photo preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-muted-foreground">
              <CarFront size={18} />
              No photo selected
            </div>
          )}

          <div className="absolute right-3 top-3 flex gap-2">
            <label className="cursor-pointer rounded-md bg-black/70 px-2 py-1 text-xs text-white">
              {photoPreview ? "Change photo" : "Add photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
                disabled={isSaving}
              />
            </label>
            {photoPreview ? (
              <button
                type="button"
                className="rounded-md bg-black/70 px-2 py-1 text-xs text-white"
                onClick={handleRemovePhoto}
                disabled={isSaving}
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>

        <div className="p-6">
        <h2 className="mb-4 text-xl font-semibold">
          {editingCar ? "Edit car" : "Create car"}
        </h2>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            placeholder="Brand"
            value={formData.brand}
            onChange={(event) =>
              onFormChange({ ...formData, brand: event.target.value })
            }
            required
          />
          <Input
            placeholder="Model"
            value={formData.model}
            onChange={(event) =>
              onFormChange({ ...formData, model: event.target.value })
            }
            required
          />
          <Input
            type="number"
            placeholder="Year"
            value={formData.year}
            onChange={(event) =>
              onFormChange({ ...formData, year: event.target.value })
            }
            required
          />
          <Input
            type="number"
            placeholder="Mileage"
            value={formData.mileage}
            onChange={(event) =>
              onFormChange({ ...formData, mileage: event.target.value })
            }
            required
          />
          <textarea
            placeholder="Notes"
            value={formData.notes}
            onChange={(event) =>
              onFormChange({ ...formData, notes: event.target.value })
            }
            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? "Saving..."
                : editingCar
                  ? "Save changes"
                  : "Add"}
            </Button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
