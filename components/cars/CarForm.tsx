"use client";

import { FormEvent } from "react";
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
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">
          {editingCar ? "Edit car" : "Create car"}
        </h2>

        <form className="space-y-3" onSubmit={onSubmit}>
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
  );
}
