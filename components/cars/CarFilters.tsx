"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type CarFiltersState = {
  query: string;
  brand: string;
  model: string;
  yearMin: string;
  yearMax: string;
  mileageMin: string;
  mileageMax: string;
};

interface CarFiltersProps {
  filters: CarFiltersState;
  onFiltersChange: (filters: CarFiltersState) => void;
  onClearFilters: () => void;
}

export function CarFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: CarFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field: keyof CarFiltersState, value: string) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search" className="block text-center">
            Search
          </Label>
          <Input
            id="search"
            placeholder="Search by brand, model, year or mileage"
            value={filters.query}
            onChange={(event) => handleChange("query", event.target.value)}
            className="text-center"
          />
        </div>

        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsExpanded((currentState) => !currentState)}
          >
            {isExpanded ? "Hide filters" : "Filter"}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                placeholder="Type brand"
                value={filters.brand}
                onChange={(event) => handleChange("brand", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="Type model"
                value={filters.model}
                onChange={(event) => handleChange("model", event.target.value)}
              />
            </div>

            <div className="space-y-2 rounded-md border p-3">
              <Label className="mb-2 block">Mileage range (km)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="mileage-min"
                  type="number"
                  inputMode="numeric"
                  placeholder="From"
                  value={filters.mileageMin}
                  onChange={(event) =>
                    handleChange("mileageMin", event.target.value)
                  }
                />
                <Input
                  id="mileage-max"
                  type="number"
                  inputMode="numeric"
                  placeholder="To"
                  value={filters.mileageMax}
                  onChange={(event) =>
                    handleChange("mileageMax", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2 rounded-md border p-3">
              <Label className="mb-2 block">Year range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="year-min"
                  type="number"
                  inputMode="numeric"
                  placeholder="From"
                  value={filters.yearMin}
                  onChange={(event) => handleChange("yearMin", event.target.value)}
                />
                <Input
                  id="year-max"
                  type="number"
                  inputMode="numeric"
                  placeholder="To"
                  value={filters.yearMax}
                  onChange={(event) => handleChange("yearMax", event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onClearFilters}>
              Clear filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}