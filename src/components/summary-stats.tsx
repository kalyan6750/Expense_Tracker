import { Expense } from "@/hooks/use-expenses";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORIES } from "@/lib/constants";
import { useMemo } from "react";
import { AlertTriangle, AlertCircle } from "lucide-react";

export function SummaryStats({ 
  expenses, 
  currentMonthExpenses,
  budgets 
}: { 
  expenses: Expense[];
  currentMonthExpenses?: Expense[];
  budgets?: Record<string, number>;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const totalSpent = useMemo(() => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const breakdown = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {} as Record<string, number>);

    expenses.forEach(e => {
      if (breakdown[e.category] !== undefined) {
        breakdown[e.category] += e.amount;
      }
    });

    return Object.entries(breakdown)
      .filter(([_, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const currentMonthBreakdown = useMemo(() => {
    const breakdown = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {} as Record<string, number>);

    if (currentMonthExpenses) {
      currentMonthExpenses.forEach(e => {
        if (breakdown[e.category] !== undefined) {
          breakdown[e.category] += e.amount;
        }
      });
    }

    return breakdown;
  }, [currentMonthExpenses]);

  return (
    <Card className="shadow-sm border-border overflow-hidden">
      <div className="bg-primary p-6 text-primary-foreground">
        <h3 className="text-sm font-medium opacity-80 mb-1">Total Spent</h3>
        <p className="text-4xl font-mono font-semibold tracking-tight" data-testid="text-total-spent">
          {formatCurrency(totalSpent)}
        </p>
        <p className="text-sm opacity-70 mt-2">
          {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} recorded
        </p>
      </div>
      
      {categoryBreakdown.length > 0 && (
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium text-foreground mb-4">Spending by Category</h4>
          <div className="space-y-4">
            {categoryBreakdown.map(([category, amount]) => {
              const budgetAmount = budgets?.[category] || 0;
              const hasBudget = budgetAmount > 0;
              
              const currentMonthAmount = currentMonthBreakdown[category] || 0;
              
              let barPercentage = Math.round((amount / totalSpent) * 100);
              let barColorClass = "bg-primary/60";
              let overBudgetAmount = 0;
              let warningIcon = null;

              if (hasBudget) {
                const percentUsed = (currentMonthAmount / budgetAmount) * 100;
                barPercentage = Math.min(Math.round(percentUsed), 100);
                
                if (percentUsed >= 100) {
                  barColorClass = "bg-destructive";
                  overBudgetAmount = currentMonthAmount - budgetAmount;
                  warningIcon = <AlertCircle className="w-4 h-4 text-destructive" data-testid={`icon-over-budget-${category}`} />;
                } else if (percentUsed >= 75) {
                  barColorClass = "bg-amber-500";
                  warningIcon = <AlertTriangle className="w-4 h-4 text-amber-500" data-testid={`icon-warning-budget-${category}`} />;
                } else {
                  barColorClass = "bg-emerald-500";
                }
              }

              return (
                <div key={category} className="space-y-1.5" data-testid={`category-row-${category}`}>
                  <div className="flex justify-between text-sm items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground font-medium">{category}</span>
                      {warningIcon}
                    </div>
                    <span className="font-mono text-foreground font-medium">{formatCurrency(amount)}</span>
                  </div>
                  
                  {hasBudget && (
                    <div className="flex justify-between text-xs text-muted-foreground pb-0.5">
                      <span>This month: {formatCurrency(currentMonthAmount)} / {formatCurrency(budgetAmount)}</span>
                      {overBudgetAmount > 0 && (
                        <span className="text-destructive font-medium">+{formatCurrency(overBudgetAmount)} over</span>
                      )}
                    </div>
                  )}

                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${hasBudget ? barColorClass : "bg-primary/60"}`}
                      style={{ width: `${barPercentage}%` }}
                      data-testid={`progress-bar-${category}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
