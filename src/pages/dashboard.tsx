import { useState, useMemo } from "react";
import { useExpenses } from "@/hooks/use-expenses";
import { useBudgets } from "@/hooks/use-budgets";
import { AddExpenseForm } from "@/components/add-expense-form";
import { ExpenseList } from "@/components/expense-list";
import { SummaryStats } from "@/components/summary-stats";
import { BudgetSettings } from "@/components/budget-settings";
import { MonthlyOverview } from "@/components/monthly-overview";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES } from "@/lib/constants";

export default function Dashboard() {
  const { expenses, addExpense, deleteExpense } = useExpenses();
  const budgetProps = useBudgets();
  const [filter, setFilter] = useState<string>("All");

  const filteredExpenses = useMemo(() => {
    if (filter === "All") return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return expenses
      .filter(e => e.category === filter)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filter]);

  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return expenses.filter(e => e.date.startsWith(currentYearMonth));
  }, [expenses]);

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight" data-testid="text-header">
              Expense Tracker
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Keep track of your spending effortlessly.
            </p>
          </div>
          <BudgetSettings {...budgetProps} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <section aria-labelledby="add-expense-heading">
              <h2 id="add-expense-heading" className="sr-only">Add new expense</h2>
              <AddExpenseForm onAdd={addExpense} />
            </section>
            
            <section aria-labelledby="summary-stats-heading">
              <h2 id="summary-stats-heading" className="sr-only">Summary statistics</h2>
              <SummaryStats 
                expenses={expenses} 
                currentMonthExpenses={currentMonthExpenses}
                budgets={budgetProps.budgets}
              />
            </section>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-medium tracking-tight">Recent Expenses</h2>
              <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto overflow-x-auto">
                <TabsList className="w-full sm:w-auto inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground">
                  <TabsTrigger value="All" className="px-3">All</TabsTrigger>
                  {CATEGORIES.map(cat => (
                    <TabsTrigger key={cat} value={cat} className="px-3">{cat}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <ExpenseList expenses={filteredExpenses} onDelete={deleteExpense} />
          </div>
        </div>

        <section aria-labelledby="monthly-overview-heading" className="space-y-4">
          <h2 id="monthly-overview-heading" className="text-xl font-medium tracking-tight">Monthly Overview — {new Date().getFullYear()}</h2>
          <MonthlyOverview expenses={expenses} budgets={budgetProps.budgets} />
        </section>
      </div>
    </div>
  );
}
