import { useState, useEffect } from 'react';

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  createdAt: number;
};

const STORAGE_KEY = 'expense-tracker-data';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      if (item) return JSON.parse(item);
    } catch (e) {
      console.error('Failed to parse expenses from local storage');
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  return { expenses, addExpense, deleteExpense };
}
