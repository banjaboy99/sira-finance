import { useState } from "react";
import { Plus, Calendar, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";

const Expenses = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Placeholder data
  const expenses = [
    {
      id: 1,
      category: "Rent",
      amount: 150000,
      date: "2025-10-01",
      description: "Monthly shop rent",
      recurring: true,
    },
    {
      id: 2,
      category: "Utilities",
      amount: 25000,
      date: "2025-10-03",
      description: "Electricity bill",
      recurring: false,
    },
  ];

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <BackButton title="Expenses" subtitle="Track your business expenses" />
      
      <div className="flex items-center justify-between mb-6">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total This Month</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(totalExpenses)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-error" />
              <span>+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Recurring</CardDescription>
            <CardTitle className="text-2xl">
              {expenses.filter(e => e.recurring).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Categories</CardDescription>
            <CardTitle className="text-2xl">
              {new Set(expenses.map(e => e.category)).size}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Expense types</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Expenses</h2>
          <div className="flex gap-2">
            {["week", "month", "year"].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {expenses.map((expense) => (
          <Card key={expense.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{expense.category}</h3>
                    {expense.recurring && (
                      <Badge variant="secondary">Recurring</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{expense.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(expense.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-error">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Expenses;
