export type Recipe = {
  id: number;
  name: string;
  yield_count: number;
  selling_price: number;
  package_cost?: number;
  bag_cost: number;
  silica_gel_cost: number;
  oxygen_absorber_cost: number;
  seal_cost: number;
  box_cost: number;
};

export type Ingredient = {
  id: number;
  name: string;
  price: number;
  amount_g: number;
  energy: number;
  protein: number;
  fat: number;
  carbs: number;
  salt: number;
};

export type RecipeItem = {
  id: number;
  amount_g: number;
  ingredients: Ingredient;
};