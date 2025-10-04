import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Package, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const stats = {
    revenue: 450000,
    expenses: 180000,
    profit: 270000,
    invoices: 24,
    growth: 15.3,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <BackButton title="Reports" subtitle="Business performance overview" />
      
      <div className="mb-6">
      </div>

      <div className="flex gap-2 mb-6">
        {["week", "month", "quarter", "year"].map((period) => (
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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  Revenue
                </CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(stats.revenue)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-success">
                  <TrendingUp className="h-4 w-4" />
                  <span>+{stats.growth}% from last {selectedPeriod}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-error" />
                  Expenses
                </CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(stats.expenses)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {((stats.expenses / stats.revenue) * 100).toFixed(1)}% of revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Net Profit
                </CardDescription>
                <CardTitle className="text-2xl">{formatCurrency(stats.profit)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {((stats.profit / stats.revenue) * 100).toFixed(1)}% margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  Invoices
                </CardDescription>
                <CardTitle className="text-2xl">{stats.invoices}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This {selectedPeriod}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss Statement</CardTitle>
              <CardDescription>For the selected {selectedPeriod}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="font-medium">Total Revenue</span>
                  <span className="text-success font-semibold">{formatCurrency(stats.revenue)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="font-medium">Total Expenses</span>
                  <span className="text-error font-semibold">-{formatCurrency(stats.expenses)}</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-bold">Net Profit</span>
                  <span className="text-lg font-bold text-primary">{formatCurrency(stats.profit)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
