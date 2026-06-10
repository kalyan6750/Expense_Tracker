import { Expense } from "@/hooks/use-expenses";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ExpenseList({ expenses, onDelete }: { expenses: Expense[], onDelete: (id: string) => void }) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed border-border bg-muted/20">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-muted-foreground font-serif italic text-xl">#</span>
        </div>
        <h3 className="text-lg font-medium text-foreground">No expenses found</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-sm">
          You haven't recorded any expenses yet. Add one to get started.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {expenses.map((expense) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            layout
          >
            <Card className="p-4 flex items-center justify-between group hover:border-primary/20 transition-colors shadow-sm" data-testid={`card-expense-${expense.id}`}>
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-medium text-sm">
                  {expense.category.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="text-foreground font-medium truncate" data-testid={`text-desc-${expense.id}`}>
                    {expense.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{formatDate(expense.date)}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4 leading-4 font-normal bg-secondary text-secondary-foreground border-transparent">
                      {expense.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 pl-4">
                <p className="font-mono font-medium text-foreground tracking-tight" data-testid={`text-amount-${expense.id}`}>
                  {formatCurrency(expense.amount)}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all focus:opacity-100"
                  onClick={() => onDelete(expense.id)}
                  data-testid={`button-delete-${expense.id}`}
                  aria-label="Delete expense"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
