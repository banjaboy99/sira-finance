import { useState, useEffect, useRef } from "react";
import { DollarSign, TrendingDown, PieChart, Plus, Trash2, Calendar, Cloud, AlertTriangle, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";
import { useOfflineBudgets } from "@/hooks/useOfflineBudgets";
import { useOfflineExpenses } from "@/hooks/useOfflineExpenses";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/contexts/CurrencyContext";

const CATEGORIES = [
  "Inventory",
  "Supplies",
  "Marketing",
  "Utilities",
  "Rent",
  "Salaries",
  "Equipment",
  "Transportation",
  "Food & Beverages",
  "Maintenance",
  "Other",
];

const Finances = () => {
  const { toast } = useToast();
  const { format: formatMoney } = useCurrency();
  const { budgets, addBudget, deleteBudget, isLoading: budgetsLoading } = useOfflineBudgets();
  const { expenses, addExpense, deleteExpense, isLoading: expensesLoading } = useOfflineExpenses();

  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);

  const [budgetForm, setBudgetForm] = useState({
    category: "",
    amount: "",
    period: "monthly" as "monthly" | "quarterly" | "yearly",
  });

  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!budgetForm.category || !budgetForm.amount) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    await addBudget({
      category: budgetForm.category,
      amount: parseFloat(budgetForm.amount),
      period: budgetForm.period,
    });

    toast({
      title: "Budget added",
      description: `Budget for ${budgetForm.category} has been set`,
    });

    setBudgetForm({ category: "", amount: "", period: "monthly" });
    setBudgetDialogOpen(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expenseForm.description || !expenseForm.amount || !expenseForm.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Find matching budget for the category
    const matchingBudget = budgets.find(b => b.category === expenseForm.category);

    await addExpense({
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      date: expenseForm.date,
      budget_id: matchingBudget?.id,
    });

    toast({
      title: "Expense added",
      description: `${formatMoney(parseFloat(expenseForm.amount))} expense recorded`,
    });

    setExpenseForm({
      description: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setExpenseDialogOpen(false);
  };

  const handleDeleteBudget = async (id: string) => {
    await deleteBudget(id);
    toast({
      title: "Budget deleted",
      description: "Budget has been removed",
    });
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteExpense(id);
    toast({
      title: "Expense deleted",
      description: "Expense has been removed",
    });
  };

  const calculateCategorySpending = (category: string) => {
    return expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const calculateTotalSpending = () => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  };

  const calculateTotalBudget = () => {
    return budgets.reduce((sum, b) => sum + b.amount, 0);
  };

  const getBudgetStatus = (category: string, budget: number) => {
    const spent = calculateCategorySpending(category);
    const percentage = (spent / budget) * 100;

    if (percentage >= 100) return { color: "bg-destructive/10 text-destructive border-destructive/20", status: "Over Budget", percentage };
    if (percentage >= 80) return { color: "bg-warning/10 text-warning border-warning/20", status: "Warning", percentage };
    return { color: "bg-success/10 text-success border-success/20", status: "On Track", percentage };
  };

  // Calculate budget alerts
  const getBudgetAlerts = () => {
    return budgets
      .map((budget) => {
        const spent = calculateCategorySpending(budget.category);
        const percentage = (spent / budget.amount) * 100;
        const remaining = budget.amount - spent;
        
        if (percentage >= 100) {
          return {
            id: budget.id,
            category: budget.category,
            type: 'exceeded' as const,
            message: `Over budget by ${formatMoney(Math.abs(remaining))}`,
            percentage,
          };
        } else if (percentage >= 80) {
          return {
            id: budget.id,
            category: budget.category,
            type: 'warning' as const,
            message: `${percentage.toFixed(0)}% spent - ${formatMoney(remaining)} remaining`,
            percentage,
          };
        }
        return null;
      })
      .filter(Boolean) as Array<{
        id: string;
        category: string;
        type: 'exceeded' | 'warning';
        message: string;
        percentage: number;
      }>;
  };

  const budgetAlerts = getBudgetAlerts();
  const notifiedAlertsRef = useRef<Set<string>>(new Set());
  const isLoading = budgetsLoading || expensesLoading;

  // Show toast notifications for budget alerts
  useEffect(() => {
    if (isLoading) return;
    
    budgetAlerts.forEach((alert) => {
      const alertKey = `${alert.id}-${alert.type}`;
      
      // Only notify once per alert type per budget
      if (!notifiedAlertsRef.current.has(alertKey)) {
        notifiedAlertsRef.current.add(alertKey);
        
        if (alert.type === 'exceeded') {
          toast({
            title: `🚨 Budget Exceeded: ${alert.category}`,
            description: alert.message,
            variant: "destructive",
          });
        } else if (alert.type === 'warning') {
          toast({
            title: `⚠️ Budget Warning: ${alert.category}`,
            description: alert.message,
          });
        }
      }
    });
  }, [budgetAlerts, isLoading, toast]);

  return (
    <div className="min-h-screen bg-background">
      <BackButton title="Finances" subtitle="Track budgets and expenses for your business" to="/" />
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">

        {/* Budget Alerts Banner */}
        {budgetAlerts.length > 0 && (
          <Card className="mb-6 border-warning/50 bg-warning/5">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-warning/20">
                  <Bell className="h-5 w-5 text-warning" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    Budget Alerts
                    <Badge variant="secondary" className="text-xs">
                      {budgetAlerts.length}
                    </Badge>
                  </h3>
                  <div className="mt-2 space-y-2">
                    {budgetAlerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`flex items-center gap-2 text-sm ${
                          alert.type === 'exceeded' ? 'text-destructive' : 'text-warning'
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium">{alert.category}:</span>
                        <span>{alert.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Budget
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    {formatMoney(calculateTotalBudget())}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {budgets.length} categories
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    {formatMoney(calculateTotalSpending())}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {expenses.length} expenses
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Remaining
              </CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    {formatMoney(calculateTotalBudget() - calculateTotalSpending())}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {calculateTotalBudget() > 0 
                      ? `${((1 - calculateTotalSpending() / calculateTotalBudget()) * 100).toFixed(1)}% of budget`
                      : "No budget set"
                    }
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="budgets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-5 w-5" />
                    Add Budget
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddBudget}>
                    <DialogHeader>
                      <DialogTitle>Set Budget</DialogTitle>
                      <DialogDescription>
                        Create a budget for a category
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="budgetCategory">Category</Label>
                        <Select
                          value={budgetForm.category}
                          onValueChange={(value) =>
                            setBudgetForm({ ...budgetForm, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="budgetAmount">Amount</Label>
                        <Input
                          id="budgetAmount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={budgetForm.amount}
                          onChange={(e) =>
                            setBudgetForm({ ...budgetForm, amount: e.target.value })
                          }
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="budgetPeriod">Period</Label>
                        <Select
                          value={budgetForm.period}
                          onValueChange={(value: "monthly" | "quarterly" | "yearly") =>
                            setBudgetForm({ ...budgetForm, period: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Budget</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {budgets.map((budget) => {
                  const spent = calculateCategorySpending(budget.category);
                  const percentage = (spent / budget.amount) * 100;
                  const status = getBudgetStatus(budget.category, budget.amount);

                  return (
                    <Card key={budget.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg text-foreground">
                                {budget.category}
                              </h3>
                              {!budget.synced && (
                                <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                                  <Cloud className="h-3 w-3 mr-1" />
                                  Pending sync
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">
                              {budget.period || 'monthly'} budget
                            </p>
                          </div>
                          <Badge variant="outline" className={status.color}>
                            {status.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-2"
                            onClick={() => handleDeleteBudget(budget.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {formatMoney(spent)} spent of {formatMoney(budget.amount)}
                            </span>
                            <span className="font-medium text-foreground">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full transition-all"
                              style={{
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: percentage >= 100 ? "hsl(var(--destructive))" : percentage >= 80 ? "hsl(var(--warning))" : "hsl(var(--success))",
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {budgets.length === 0 && (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No budgets set. Click "Add Budget" to create one.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-5 w-5" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddExpense}>
                    <DialogHeader>
                      <DialogTitle>Record Expense</DialogTitle>
                      <DialogDescription>
                        Add a new expense to track spending
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="expenseDescription">Description</Label>
                        <Input
                          id="expenseDescription"
                          value={expenseForm.description}
                          onChange={(e) =>
                            setExpenseForm({ ...expenseForm, description: e.target.value })
                          }
                          placeholder="What was this expense for?"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="expenseAmount">Amount</Label>
                        <Input
                          id="expenseAmount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={expenseForm.amount}
                          onChange={(e) =>
                            setExpenseForm({ ...expenseForm, amount: e.target.value })
                          }
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="expenseCategory">Category</Label>
                        <Select
                          value={expenseForm.category}
                          onValueChange={(value) =>
                            setExpenseForm({ ...expenseForm, category: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="expenseDate">Date</Label>
                        <Input
                          id="expenseDate"
                          type="date"
                          value={expenseForm.date}
                          onChange={(e) =>
                            setExpenseForm({ ...expenseForm, date: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="expenseNotes">Notes (Optional)</Label>
                        <Textarea
                          id="expenseNotes"
                          value={expenseForm.notes}
                          onChange={(e) =>
                            setExpenseForm({ ...expenseForm, notes: e.target.value })
                          }
                          placeholder="Additional details..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Add Expense</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {expenses.map((expense) => (
                  <Card key={expense.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">{expense.description}</h3>
                            <Badge variant="outline">{expense.category}</Badge>
                            {!expense.synced && (
                              <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                                <Cloud className="h-3 w-3 mr-1" />
                                Pending sync
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {expense.date}
                            </span>
                            <span className="text-lg font-bold text-foreground">
                              {formatMoney(expense.amount)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {expenses.length === 0 && (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No expenses recorded. Click "Add Expense" to track one.
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {CATEGORIES.map((category) => {
                        const spent = calculateCategorySpending(category);
                        const totalSpent = calculateTotalSpending();
                        const percentage = totalSpent > 0 ? (spent / totalSpent) * 100 : 0;

                        if (spent === 0) return null;

                        return (
                          <div key={category}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-medium text-foreground">{category}</span>
                              <span className="text-muted-foreground">
                                {formatMoney(spent)} ({percentage.toFixed(1)}%)
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {calculateTotalSpending() === 0 && (
                        <p className="text-center text-muted-foreground">
                          No expenses to analyze yet
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget vs Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {budgets.map((budget) => {
                        const spent = calculateCategorySpending(budget.category);
                        const difference = budget.amount - spent;

                        return (
                          <div key={budget.id} className="flex justify-between items-center py-2 border-b last:border-0">
                            <div>
                              <p className="font-medium text-foreground">{budget.category}</p>
                              <p className="text-sm text-muted-foreground capitalize">{budget.period || 'monthly'}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-foreground">
                                {formatMoney(spent)} / {formatMoney(budget.amount)}
                              </p>
                              <p className={`text-sm ${difference >= 0 ? "text-success" : "text-destructive"}`}>
                                {difference >= 0 ? "+" : "-"}{formatMoney(Math.abs(difference))}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {budgets.length === 0 && (
                        <p className="text-center text-muted-foreground">
                          Set budgets to see comparison
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Finances;
