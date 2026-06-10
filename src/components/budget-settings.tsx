import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Settings, Trash2 } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useBudgets } from "@/hooks/use-budgets";

const budgetSchema = z.object({
  budgets: z.record(z.coerce.number().min(0, "Must be >= 0").optional())
});

export function BudgetSettings({ budgets, setBudget, removeBudget }: ReturnType<typeof useBudgets>) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof budgetSchema>>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      budgets: CATEGORIES.reduce((acc, cat) => {
        acc[cat] = budgets[cat] || 0;
        return acc;
      }, {} as Record<string, number>)
    }
  });

  const onSubmit = (data: z.infer<typeof budgetSchema>) => {
    CATEGORIES.forEach(cat => {
      const amount = data.budgets[cat];
      if (amount && amount > 0) {
        setBudget(cat, amount);
      } else if (budgets[cat]) {
        removeBudget(cat);
      }
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) {
        form.reset({
          budgets: CATEGORIES.reduce((acc, cat) => {
            acc[cat] = budgets[cat] || 0;
            return acc;
          }, {} as Record<string, number>)
        });
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-set-budgets">
          <Settings className="w-4 h-4" />
          <span>Set Budgets</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Monthly Budgets</DialogTitle>
          <DialogDescription>
            Set a monthly spending limit for each category. Leave as 0 or empty for no limit.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 pb-1">
              {CATEGORIES.map(category => (
                <FormField
                  key={category}
                  control={form.control}
                  name={`budgets.${category}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0 gap-4">
                      <FormLabel className="w-32 text-sm font-medium">{category}</FormLabel>
                      <div className="flex-1 flex items-center gap-2">
                        <FormControl>
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              className="pl-7"
                              {...field}
                              value={field.value || ""}
                              onChange={e => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                              data-testid={`input-budget-${category}`}
                            />
                          </div>
                        </FormControl>
                        {(budgets[category] > 0 || (field.value && field.value > 0)) ? (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => field.onChange(0)}
                            data-testid={`button-remove-budget-${category}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <div className="w-9 shrink-0" />
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            
            <div className="pt-4 flex justify-end">
              <Button type="submit" data-testid="button-save-budgets">Save Budgets</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
