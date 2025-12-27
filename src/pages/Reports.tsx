import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, DollarSign, Package, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOfflineInvoices } from "@/hooks/useOfflineInvoices";
import { useOfflineExpenses } from "@/hooks/useOfflineExpenses";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslation } from "react-i18next";
import { startOfWeek, startOfMonth, startOfQuarter, startOfYear, isAfter } from "date-fns";

const Reports = () => {
  const { t } = useTranslation();
  const { format } = useCurrency();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  
  const { invoices, isLoading: invoicesLoading } = useOfflineInvoices();
  const { expenses, isLoading: expensesLoading } = useOfflineExpenses();

  // Calculate period start date
  const periodStart = useMemo(() => {
    const now = new Date();
    switch (selectedPeriod) {
      case "week":
        return startOfWeek(now);
      case "month":
        return startOfMonth(now);
      case "quarter":
        return startOfQuarter(now);
      case "year":
        return startOfYear(now);
      default:
        return startOfMonth(now);
    }
  }, [selectedPeriod]);

  // Filter data by period
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const invDate = new Date(inv.created_at || inv.updated_at || Date.now());
      return isAfter(invDate, periodStart);
    });
  }, [invoices, periodStart]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date || exp.created_at || Date.now());
      return isAfter(expDate, periodStart);
    });
  }, [expenses, periodStart]);

  // Calculate real stats
  const stats = useMemo(() => {
    const paidInvoices = filteredInvoices.filter(inv => inv.status === "paid");
    const revenue = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const profit = revenue - totalExpenses;
    const invoiceCount = filteredInvoices.length;

    return {
      revenue,
      expenses: totalExpenses,
      profit,
      invoices: invoiceCount,
      growth: 0, // Would need historical data to calculate
    };
  }, [filteredInvoices, filteredExpenses]);

  const isLoading = invoicesLoading || expensesLoading;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <BackButton title={t('nav.reports')} subtitle={t('reports.subtitle')} />
      
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
            {t(`reports.${period}`)}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">{t('reports.overview')}</TabsTrigger>
          <TabsTrigger value="sales">{t('reports.sales')}</TabsTrigger>
          <TabsTrigger value="expenses">{t('nav.expenses')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  {t('reports.revenue')}
                </CardDescription>
                <CardTitle className="text-2xl">
                  {isLoading ? "..." : format(stats.revenue)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{t('reports.paidInvoices')}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-error" />
                  {t('nav.expenses')}
                </CardDescription>
                <CardTitle className="text-2xl">
                  {isLoading ? "..." : format(stats.expenses)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {stats.revenue > 0 
                    ? `${((stats.expenses / stats.revenue) * 100).toFixed(1)}% ${t('reports.ofRevenue')}`
                    : t('reports.noRevenue')
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  {t('reports.netProfit')}
                </CardDescription>
                <CardTitle className={`text-2xl ${stats.profit < 0 ? 'text-error' : ''}`}>
                  {isLoading ? "..." : format(stats.profit)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {stats.revenue > 0 
                    ? `${((stats.profit / stats.revenue) * 100).toFixed(1)}% ${t('reports.margin')}`
                    : t('reports.noData')
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-accent" />
                  {t('nav.invoices')}
                </CardDescription>
                <CardTitle className="text-2xl">
                  {isLoading ? "..." : stats.invoices}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t('reports.thisPeriod', { period: t(`reports.${selectedPeriod}`) })}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('reports.profitLoss')}</CardTitle>
              <CardDescription>{t('reports.forSelected', { period: t(`reports.${selectedPeriod}`) })}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="font-medium">{t('reports.totalRevenue')}</span>
                  <span className="text-success font-semibold">
                    {isLoading ? "..." : format(stats.revenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="font-medium">{t('reports.totalExpenses')}</span>
                  <span className="text-error font-semibold">
                    -{isLoading ? "..." : format(stats.expenses)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-bold">{t('reports.netProfit')}</span>
                  <span className={`text-lg font-bold ${stats.profit < 0 ? 'text-error' : 'text-primary'}`}>
                    {isLoading ? "..." : format(stats.profit)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.salesAnalytics')}</CardTitle>
              <CardDescription>{t('common.comingSoon')}</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>{t('reports.expenseBreakdown')}</CardTitle>
              <CardDescription>{t('common.comingSoon')}</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
