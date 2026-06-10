export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Bills",
  "Other"
] as const;

export type Category = typeof CATEGORIES[number];
