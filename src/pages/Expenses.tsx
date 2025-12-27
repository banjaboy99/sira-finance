import { useState } from "react";
import { Plus, Calendar, TrendingDown, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { useOfflineExpenses } from "@/hooks/useOfflineExpenses";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXPENSE_CATEGORIES = [
  "Rent",
  "Utilities",
  "Supplies",
  "Transportation",
  "Marketing",
  "Salaries",
  "Equipment",
  "Insurance",
  "Taxes",
  "Other",
];

const Expenses = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { format } = useCurrency();
  const { expenses, addExpense, updateExpense, deleteExpense, isLoading } = useOfflineExpenses();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingExpense) {
        await updateExpense(editingExpense, {
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          date: formData.date,
        });
        toast({
          title: t('expenses.updated'),
          description: t('expenses.updatedDesc'),
        });
      } else {
        await addExpense({
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          date: formData.date,
        });
        toast({
          title: t('expenses.added'),
          description: t('expenses.addedDesc'),
        });
      }
      
      setFormData({ amount: "", category: "", description: "", date: new Date().toISOString().split('T')[0] });
      setEditingExpense(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('expenses.saveFailed'),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (expense: typeof expenses[0]) => {
    setEditingExpense(expense.id!);
    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || "",
      date: expense.date,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      toast({
        title: t('expenses.deleted'),
        description: t('expenses.deletedDesc'),
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('expenses.deleteFailed'),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <Package className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl pb-24">
      <BackButton title={t('nav.expenses')} subtitle={t('expenses.subtitle')} />
      
      <div className="flex items-center justify-between mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingExpense(null);
              setFormData({ amount: "", category: "", description: "", date: new Date().toISOString().split('T')[0] });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              {t('expenses.addExpense')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingExpense ? t('expenses.editExpense') : t('expenses.addExpense')}</DialogTitle>
                <DialogDescription>
                  {editingExpense ? t('expenses.editExpenseDesc') : t('expenses.addExpenseDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">{t('common.amount')} *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">{t('common.category')} *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('expenses.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">{t('common.date')} *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">{t('common.description')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('expenses.descriptionPlaceholder')}
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingExpense ? t('common.update') : t('common.add')} {t('nav.expenses')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('expenses.totalThisMonth')}</CardDescription>
            <CardTitle className="text-2xl">{format(totalExpenses)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-error" />
              <span>{expenses.length} {t('expenses.recorded')}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('expenses.categories')}</CardDescription>
            <CardTitle className="text-2xl">
              {new Set(expenses.map(e => e.category)).size}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('expenses.typesTracked')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('expenses.average')}</CardDescription>
            <CardTitle className="text-2xl">
              {format(expenses.length > 0 ? totalExpenses / expenses.length : 0)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('expenses.perExpense')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('expenses.recentExpenses')}</h2>
          <div className="flex gap-2">
            {["week", "month", "year"].map((period) => (
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
        </div>

        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <TrendingDown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('expenses.noExpenses')}</h3>
            <p className="text-muted-foreground">{t('expenses.startTracking')}</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{expense.category}</h3>
                      {!expense.synced && (
                        <Badge variant="outline" className="text-xs">{t('common.pendingSync')}</Badge>
                      )}
                    </div>
                    {expense.description && (
                      <p className="text-sm text-muted-foreground">{expense.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(expense.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-error">
                      {format(Number(expense.amount))}
                    </p>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id!)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Expenses;
