import { useMemo } from "react";
import { Expense } from "@/hooks/use-expenses";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export function MonthlyOverview({
  expenses,
  budgets,
}: {
  expenses: Expense[];
  budgets: Record<string, number>;
}) {
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();

  const totalBudget = useMemo(() => {
    return CATEGORIES.reduce((acc, cat) => acc + (budgets[cat] || 0), 0);
  }, [budgets]);

  const hasBudget = totalBudget > 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const monthlyData = useMemo(() => {
    return MONTHS.map((monthName, index) => {
      const yearMonth = `${currentYear}-${String(index + 1).padStart(2, '0')}`;
      const monthExpenses = expenses.filter(e => e.date.startsWith(yearMonth));
      const totalSpent = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

      const isFuture = index > currentMonthIndex;
      const isCurrent = index === currentMonthIndex;

      let percentUsed = 0;
      let status = "none";

      if (hasBudget) {
        percentUsed = (totalSpent / totalBudget) * 100;
        if (percentUsed >= 100) {
          status = "over";
        } else if (percentUsed >= 75) {
          status = "warn";
        } else if (totalSpent > 0 || isCurrent) {
          status = "under";
        }
      }

      return {
        monthName,
        index,
        totalSpent,
        isFuture,
        isCurrent,
        percentUsed,
        status,
        hasData: totalSpent > 0
      };
    });
  }, [expenses, currentYear, currentMonthIndex, hasBudget, totalBudget]);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
      <AnimatePresence>
        {monthlyData.map((data, i) => {
          let barColorClass = "bg-primary/60";
          if (hasBudget) {
            if (data.status === "over") barColorClass = "bg-destructive";
            else if (data.status === "warn") barColorClass = "bg-amber-500";
            else barColorClass = "bg-emerald-500";
          }

          const barPercentage = Math.min(Math.round(data.percentUsed), 100);

          return (
            <motion.div
              key={data.monthName}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card 
                className={`h-full flex flex-col overflow-hidden transition-all shadow-sm ${data.isFuture ? 'opacity-40 grayscale pointer-events-none' : ''} ${data.isCurrent ? 'ring-2 ring-primary border-transparent' : ''}`}
                data-testid={`card-month-${data.monthName.toLowerCase()}`}
              >
                <CardContent className="p-4 flex-1 flex flex-col relative group">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-semibold tracking-tight ${data.isCurrent ? 'text-primary' : 'text-foreground'}`}>
                      {data.monthName}
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-2 space-y-3">
                    <div>
                      <div className="text-xl font-mono font-medium tracking-tight truncate">
                        {formatCurrency(data.totalSpent)}
                      </div>
                      
                      {hasBudget ? (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          Budget: {formatCurrency(totalBudget)}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground mt-0.5 opacity-70">
                          No budget
                        </div>
                      )}
                    </div>

                    {hasBudget && !data.isFuture && (
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
                          style={{ width: `${barPercentage}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {!data.isFuture && data.status !== "none" && (
                    <div className="absolute top-3 right-3">
                      {data.status === "over" && (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Over</Badge>
                      )}
                      {data.status === "warn" && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20">Near limit</Badge>
                      )}
                      {data.status === "under" && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">On track</Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
