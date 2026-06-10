import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CATEGORIES } from "@/lib/constants";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/hooks/use-expenses";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  date: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function AddExpenseForm({ onAdd }: { onAdd: (expense: Omit<Expense, 'id' | 'createdAt'>) => void }) {
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: undefined,
      category: "",
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = (data: FormValues) => {
    onAdd(data);
    form.reset({
      description: "",
      amount: 0, // Need to provide a number or let the input be empty
      category: data.category, // keep the same category as a convenience
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    
    // Clear amount input properly
    form.setValue("amount", "" as unknown as number);
    
    toast({
      title: "Expense added",
      description: "Your expense has been saved.",
    });
  };

  return (
    <Card className="shadow-sm border-border overflow-hidden">
      <CardHeader className="bg-muted/30 pb-4">
        <CardTitle className="text-lg font-medium">Add Expense</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Lunch at cafe" {...field} data-testid="input-description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input type="number" step="0.01" placeholder="0.00" className="pl-7" {...field} value={field.value === undefined ? "" : field.value} data-testid="input-amount" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-2" data-testid="button-submit-expense">
              Save Expense
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
