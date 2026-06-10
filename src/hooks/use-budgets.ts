import { useState, useEffect } from "react";

const STORAGE_KEY = "expense-tracker-budgets";

export function useBudgets() {
  const [budgets, setBudgetsState] = useState<Record<string, number>>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) return JSON.parse(item);
    } catch (e) {
      console.error("Failed to parse budgets from local storage");
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  }, [budgets]);

  const setBudget = (category: string, amount: number) => {
    setBudgetsState((prev) => ({
      ...prev,
      [category]: amount,
    }));
  };

  const removeBudget = (category: string) => {
    setBudgetsState((prev) => {
      const newBudgets = { ...prev };
      delete newBudgets[category];
      return newBudgets;
    });
  };

  return { budgets, setBudget, removeBudget };
}
