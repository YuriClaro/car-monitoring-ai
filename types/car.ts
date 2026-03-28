export type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  notes: string | null;
  photo_path: string | null;
};

export type CarFormData = {
  brand: string;
  model: string;
  year: string;
  mileage: string;
  notes: string;
};
