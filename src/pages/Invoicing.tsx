import { useState, useRef } from "react";
import { FileText, Plus, Eye, Trash2, Calendar, Settings, Receipt as ReceiptIcon, Info, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { InvoiceTemplate, DEFAULT_TEMPLATE, Receipt } from "@/types/invoice";
import { InvoicePreview } from "@/components/InvoicePreview";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { TemplateEditor } from "@/components/TemplateEditor";
import { useOfflineInvoices } from "@/hooks/useOfflineInvoices";
import { useOfflineReceipts } from "@/hooks/useOfflineReceipts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useTranslation } from "react-i18next";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface LocalInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  status: "paid" | "pending" | "overdue";
  total: number;
  notes?: string;
  templateId: string;
  synced?: boolean;
}

const Invoicing = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { format } = useCurrency();
  const isMobile = useIsMobile();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState(true);
  
  // Use offline hooks
  const { 
    invoices: dbInvoices, 
    addInvoice, 
    updateInvoice, 
    deleteInvoice: deleteInvoiceFromDb,
    isLoading: invoicesLoading 
  } = useOfflineInvoices();
  
  const { 
    receipts: dbReceipts, 
    addReceipt, 
    deleteReceipt: deleteReceiptFromDb,
    isLoading: receiptsLoading 
  } = useOfflineReceipts();
  
  // Convert DB format to local format
  const invoices: LocalInvoice[] = dbInvoices.map(inv => ({
    id: inv.id!,
    invoiceNumber: inv.invoice_number || `INV-${inv.id?.slice(0, 3)}`,
    customerName: inv.client_name,
    customerEmail: inv.client_email || "",
    customerAddress: inv.client_address || undefined,
    date: inv.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    dueDate: inv.due_date || new Date().toISOString().split("T")[0],
    items: (inv.items as InvoiceItem[]) || [],
    status: (inv.status as "paid" | "pending" | "overdue") || "pending",
    total: inv.total || 0,
    notes: inv.notes || undefined,
    templateId: "default",
    synced: inv.synced,
  }));

  const receipts: Receipt[] = dbReceipts.map(rec => ({
    id: rec.id!,
    receiptNumber: rec.receipt_number || `REC-${rec.id?.slice(0, 3)}`,
    customerName: rec.client_name || "",
    date: rec.created_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    items: (rec.items as InvoiceItem[]) || [],
    total: rec.total || 0,
    paymentMethod: (rec.payment_method as "cash" | "card" | "transfer") || "cash",
    notes: rec.notes || undefined,
    templateId: "default",
  }));
  
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([DEFAULT_TEMPLATE]);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate>(DEFAULT_TEMPLATE);
  
  const [activeTab, setActiveTab] = useState<"invoices" | "receipts">("invoices");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<LocalInvoice | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Receipt | null>(null);
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerAddress: "",
    dueDate: "",
    notes: "",
    templateId: "default",
    itemName: "",
    itemQuantity: "1",
    itemPrice: "",
  });
  
  const [receiptFormData, setReceiptFormData] = useState({
    customerName: "",
    paymentMethod: "cash" as "cash" | "card" | "transfer",
    notes: "",
    itemName: "",
    itemQuantity: "1",
    itemPrice: "",
  });
  
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [receiptItems, setReceiptItems] = useState<InvoiceItem[]>([]);

  const handleAddItem = () => {
    if (!formData.itemName || !formData.itemPrice) {
      toast({
        title: t('invoicing.missingInfo'),
        description: t('invoicing.fillItemDetails'),
        variant: "destructive",
      });
      return;
    }

    const newItem: InvoiceItem = {
      name: formData.itemName,
      quantity: parseInt(formData.itemQuantity) || 1,
      price: parseFloat(formData.itemPrice),
    };

    setInvoiceItems([...invoiceItems, newItem]);
    setFormData({
      ...formData,
      itemName: "",
      itemQuantity: "1",
      itemPrice: "",
    });
  };

  const handleRemoveItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return invoiceItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (invoiceItems.length === 0) {
      toast({
        title: t('invoicing.noItems'),
        description: t('invoicing.addAtLeastOne'),
        variant: "destructive",
      });
      return;
    }

    try {
      await addInvoice({
        client_name: formData.customerName,
        client_email: formData.customerEmail,
        client_address: formData.customerAddress || undefined,
        items: invoiceItems,
        subtotal: calculateTotal(),
        total: calculateTotal(),
        notes: formData.notes || undefined,
        due_date: formData.dueDate,
        status: "pending",
      });

      toast({
        title: t('invoicing.invoiceCreated'),
        description: t('invoicing.invoiceCreatedDesc'),
      });

      setFormData({
        customerName: "",
        customerEmail: "",
        customerAddress: "",
        dueDate: "",
        notes: "",
        templateId: "default",
        itemName: "",
        itemQuantity: "1",
        itemPrice: "",
      });
      setInvoiceItems([]);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('invoicing.createFailed'),
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: LocalInvoice["status"]) => {
    try {
      await updateInvoice(id, { status: newStatus });
      toast({
        title: t('invoicing.statusUpdated'),
        description: t('invoicing.statusChangedTo', { status: newStatus }),
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('invoicing.updateFailed'),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const invoice = invoices.find((i) => i.id === id);
    try {
      await deleteInvoiceFromDb(id);
      toast({
        title: t('invoicing.invoiceDeleted'),
        description: `${t('nav.invoice')} ${invoice?.invoiceNumber} ${t('invoicing.hasBeenDeleted')}`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('invoicing.deleteFailed'),
        variant: "destructive",
      });
    }
  };

  const handleTemplateEdit = () => {
    setEditingTemplate(templates[0]);
    setIsTemplateEditorOpen(true);
  };

  const handleTemplateSave = (updatedTemplate: InvoiceTemplate) => {
    setTemplates([updatedTemplate]);
  };

  // Receipt handlers
  const handleAddReceiptItem = () => {
    if (!receiptFormData.itemName || !receiptFormData.itemPrice) {
      toast({
        title: t('invoicing.missingInfo'),
        description: t('invoicing.fillItemDetails'),
        variant: "destructive",
      });
      return;
    }

    const newItem: InvoiceItem = {
      name: receiptFormData.itemName,
      quantity: parseInt(receiptFormData.itemQuantity) || 1,
      price: parseFloat(receiptFormData.itemPrice),
    };

    setReceiptItems([...receiptItems, newItem]);
    setReceiptFormData({
      ...receiptFormData,
      itemName: "",
      itemQuantity: "1",
      itemPrice: "",
    });
  };

  const handleRemoveReceiptItem = (index: number) => {
    setReceiptItems(receiptItems.filter((_, i) => i !== index));
  };

  const calculateReceiptTotal = () => {
    return receiptItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (receiptItems.length === 0) {
      toast({
        title: t('invoicing.noItems'),
        description: t('invoicing.addAtLeastOneReceipt'),
        variant: "destructive",
      });
      return;
    }

    try {
      await addReceipt({
        client_name: receiptFormData.customerName || "Walk-in Customer",
        items: receiptItems,
        subtotal: calculateReceiptTotal(),
        total: calculateReceiptTotal(),
        payment_method: receiptFormData.paymentMethod,
        notes: receiptFormData.notes || undefined,
      });

      toast({
        title: t('invoicing.receiptCreated'),
        description: t('invoicing.receiptCreatedDesc'),
      });

      setReceiptFormData({
        customerName: "",
        paymentMethod: "cash",
        notes: "",
        itemName: "",
        itemQuantity: "1",
        itemPrice: "",
      });
      setReceiptItems([]);
      setIsReceiptDialogOpen(false);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('invoicing.createReceiptFailed'),
        variant: "destructive",
      });
    }
  };

  const handleDeleteReceipt = async (id: string) => {
    const receipt = receipts.find((r) => r.id === id);
    try {
      await deleteReceiptFromDb(id);
      toast({
        title: t('invoicing.receiptDeleted'),
        description: `${t('invoicing.receipt')} ${receipt?.receiptNumber} ${t('invoicing.hasBeenDeleted')}`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('invoicing.deleteReceiptFailed'),
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: LocalInvoice["status"]) => {
    switch (status) {
      case "paid":
        return "bg-success/10 text-success border-success/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "overdue":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "";
    }
  };

  const invoiceStats = {
    total: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: invoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + inv.total, 0),
    pending: invoices.filter(inv => inv.status === "pending").reduce((sum, inv) => sum + inv.total, 0),
  };

  const receiptStats = {
    total: receipts.reduce((sum, rec) => sum + rec.total, 0),
    count: receipts.length,
  };

  const isLoading = invoicesLoading || receiptsLoading;

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <FileText className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('invoicing.title')}</h1>
              <p className="text-sm text-muted-foreground">
                {invoices.length} {t('nav.invoices')} · {receipts.length} {t('invoicing.receipts')}
              </p>
            </div>
            <Button variant="outline" className="gap-2" onClick={handleTemplateEdit}>
              <Settings className="h-5 w-5" />
              {t('invoicing.customizeTemplate')}
            </Button>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer bg-gradient-to-br from-primary/5 to-transparent"
              onClick={() => {
                setInvoiceItems([]);
                setIsDialogOpen(true);
              }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{t('invoicing.createInvoice')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('invoicing.createInvoiceDesc')}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      <Plus className="h-4 w-4" />
                      <span>{t('invoicing.newInvoice')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer bg-gradient-to-br from-primary/5 to-transparent"
              onClick={() => {
                setReceiptItems([]);
                setIsReceiptDialogOpen(true);
              }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <ReceiptIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{t('invoicing.createReceipt')}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('invoicing.createReceiptDesc')}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      <Plus className="h-4 w-4" />
                      <span>{t('invoicing.newReceipt')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Dialog */}
          {isMobile ? (
            <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DrawerContent className="max-h-[90vh]">
                <div className="overflow-y-auto px-4">
                  <form onSubmit={handleSubmit}>
                    <DrawerHeader>
                      <DrawerTitle>{t('invoicing.createNewInvoice')}</DrawerTitle>
                      <DrawerDescription>
                        {t('invoicing.addDetailsInvoice')}
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="customerNameMobile">{t('invoicing.customerName')} *</Label>
                        <Input
                          id="customerNameMobile"
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          placeholder={t('invoicing.companyOrPerson')}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="customerEmailMobile">{t('invoicing.customerEmail')} *</Label>
                        <Input
                          id="customerEmailMobile"
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                          placeholder="customer@email.com"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="customerAddressMobile">{t('invoicing.customerAddress')}</Label>
                        <Textarea
                          id="customerAddressMobile"
                          value={formData.customerAddress}
                          onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                          placeholder={t('invoicing.addressPlaceholder')}
                          rows={2}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="dueDateMobile">{t('invoicing.dueDate')} *</Label>
                        <Input
                          id="dueDateMobile"
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="notesMobile">{t('common.notes')}</Label>
                        <Textarea
                          id="notesMobile"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder={t('invoicing.notesPlaceholder')}
                          rows={2}
                        />
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">{t('invoicing.invoiceItems')}</h3>
                        <div className="grid gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor="itemNameMobile">{t('invoicing.itemName')}</Label>
                            <Input
                              id="itemNameMobile"
                              value={formData.itemName}
                              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                              placeholder={t('invoicing.productOrService')}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-2">
                              <Label htmlFor="itemQuantityMobile">{t('invoicing.quantity')}</Label>
                              <Input
                                id="itemQuantityMobile"
                                type="number"
                                min="1"
                                value={formData.itemQuantity}
                                onChange={(e) => setFormData({ ...formData, itemQuantity: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="itemPriceMobile">{t('invoicing.price')}</Label>
                              <Input
                                id="itemPriceMobile"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.itemPrice}
                                onChange={(e) => setFormData({ ...formData, itemPrice: e.target.value })}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <Button type="button" onClick={handleAddItem} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            {t('invoicing.addItem')}
                          </Button>

                          {invoiceItems.length > 0 && (
                            <div className="border rounded-lg p-3 space-y-2">
                              {invoiceItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="flex-1">{item.name}</span>
                                  <span className="text-muted-foreground mx-2">×{item.quantity}</span>
                                  <span className="font-medium min-w-[80px] text-right">
                                    {format(item.quantity * item.price)}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 ml-2"
                                    onClick={() => handleRemoveItem(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <div className="flex items-center justify-between pt-2 border-t font-semibold">
                                <span>{t('common.total')}</span>
                                <span>{format(calculateTotal())}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <DrawerFooter className="flex-row gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                        {t('common.cancel')}
                      </Button>
                      <Button type="submit" className="flex-1">{t('invoicing.createInvoice')}</Button>
                    </DrawerFooter>
                  </form>
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>{t('invoicing.createNewInvoice')}</DialogTitle>
                    <DialogDescription>
                      {t('invoicing.addDetailsInvoice')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="customerName">{t('invoicing.customerName')} *</Label>
                        <Input
                          id="customerName"
                          value={formData.customerName}
                          onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                          placeholder={t('invoicing.companyOrPerson')}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="customerEmail">{t('invoicing.customerEmail')} *</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={formData.customerEmail}
                          onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                          placeholder="customer@email.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customerAddress">{t('invoicing.customerAddress')}</Label>
                      <Textarea
                        id="customerAddress"
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                        placeholder={t('invoicing.addressPlaceholder')}
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">{t('invoicing.dueDate')} *</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">{t('common.notes')}</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder={t('invoicing.notesPlaceholder')}
                        rows={2}
                      />
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">{t('invoicing.invoiceItems')}</h3>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
                          <div className="grid gap-2">
                            <Label htmlFor="itemName">{t('invoicing.itemName')}</Label>
                            <Input
                              id="itemName"
                              value={formData.itemName}
                              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                              placeholder={t('invoicing.productOrService')}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="itemQuantity">{t('invoicing.qty')}</Label>
                            <Input
                              id="itemQuantity"
                              type="number"
                              min="1"
                              value={formData.itemQuantity}
                              onChange={(e) => setFormData({ ...formData, itemQuantity: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="itemPrice">{t('invoicing.price')}</Label>
                            <Input
                              id="itemPrice"
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.itemPrice}
                              onChange={(e) => setFormData({ ...formData, itemPrice: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                          <Button type="button" onClick={handleAddItem} size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {invoiceItems.length > 0 && (
                          <div className="border rounded-lg p-3 space-y-2">
                            {invoiceItems.map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span className="flex-1">{item.name}</span>
                                <span className="text-muted-foreground mx-2">×{item.quantity}</span>
                                <span className="font-medium min-w-[80px] text-right">
                                  {format(item.quantity * item.price)}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 ml-2"
                                  onClick={() => handleRemoveItem(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                            <div className="border-t pt-2 flex justify-between font-semibold">
                              <span>{t('common.total')}:</span>
                              <span>{format(calculateTotal())}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={invoiceItems.length === 0}>
                      {t('invoicing.createInvoice')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* Receipt Dialog */}
          {isMobile ? (
            <Drawer open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
              <DrawerContent className="max-h-[90vh]">
                <div className="overflow-y-auto px-4">
                  <form onSubmit={handleReceiptSubmit}>
                    <DrawerHeader>
                      <DrawerTitle>{t('invoicing.createNewReceipt')}</DrawerTitle>
                      <DrawerDescription>
                        {t('invoicing.addDetailsReceipt')}
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="receiptCustomerNameMobile">{t('invoicing.customerNameOptional')}</Label>
                        <Input
                          id="receiptCustomerNameMobile"
                          value={receiptFormData.customerName}
                          onChange={(e) => setReceiptFormData({ ...receiptFormData, customerName: e.target.value })}
                          placeholder={t('invoicing.customerName')}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="paymentMethodMobile">{t('invoicing.paymentMethod')}</Label>
                        <Select
                          value={receiptFormData.paymentMethod}
                          onValueChange={(value: "cash" | "card" | "transfer") => 
                            setReceiptFormData({ ...receiptFormData, paymentMethod: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">{t('invoicing.cash')}</SelectItem>
                            <SelectItem value="card">{t('invoicing.card')}</SelectItem>
                            <SelectItem value="transfer">{t('invoicing.transfer')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="receiptNotesMobile">{t('common.notes')}</Label>
                        <Textarea
                          id="receiptNotesMobile"
                          value={receiptFormData.notes}
                          onChange={(e) => setReceiptFormData({ ...receiptFormData, notes: e.target.value })}
                          placeholder={t('invoicing.thankYouMessage')}
                          rows={2}
                        />
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">{t('invoicing.receiptItems')}</h3>
                        <div className="grid gap-3">
                          <div className="grid gap-2">
                            <Label htmlFor="receiptItemNameMobile">{t('invoicing.itemName')}</Label>
                            <Input
                              id="receiptItemNameMobile"
                              value={receiptFormData.itemName}
                              onChange={(e) => setReceiptFormData({ ...receiptFormData, itemName: e.target.value })}
                              placeholder={t('invoicing.productOrService')}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-2">
                              <Label htmlFor="receiptItemQuantityMobile">{t('invoicing.quantity')}</Label>
                              <Input
                                id="receiptItemQuantityMobile"
                                type="number"
                                min="1"
                                value={receiptFormData.itemQuantity}
                                onChange={(e) => setReceiptFormData({ ...receiptFormData, itemQuantity: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="receiptItemPriceMobile">{t('invoicing.price')}</Label>
                              <Input
                                id="receiptItemPriceMobile"
                                type="number"
                                step="0.01"
                                min="0"
                                value={receiptFormData.itemPrice}
                                onChange={(e) => setReceiptFormData({ ...receiptFormData, itemPrice: e.target.value })}
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <Button type="button" onClick={handleAddReceiptItem} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            {t('invoicing.addItem')}
                          </Button>

                          {receiptItems.length > 0 && (
                            <div className="border rounded-lg p-3 space-y-2">
                              {receiptItems.map((item, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="flex-1">{item.name}</span>
                                  <span className="text-muted-foreground mx-2">×{item.quantity}</span>
                                  <span className="font-medium min-w-[80px] text-right">
                                    {format(item.quantity * item.price)}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 ml-2"
                                    onClick={() => handleRemoveReceiptItem(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <div className="flex items-center justify-between pt-2 border-t font-semibold">
                                <span>{t('common.total')}</span>
                                <span>{format(calculateReceiptTotal())}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <DrawerFooter className="flex-row gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsReceiptDialogOpen(false)} className="flex-1">
                        {t('common.cancel')}
                      </Button>
                      <Button type="submit" className="flex-1">{t('invoicing.createReceipt')}</Button>
                    </DrawerFooter>
                  </form>
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleReceiptSubmit}>
                  <DialogHeader>
                    <DialogTitle>{t('invoicing.createNewReceipt')}</DialogTitle>
                    <DialogDescription>
                      {t('invoicing.addDetailsReceipt')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="receiptCustomerName">{t('invoicing.customerNameOptional')}</Label>
                      <Input
                        id="receiptCustomerName"
                        value={receiptFormData.customerName}
                        onChange={(e) => setReceiptFormData({ ...receiptFormData, customerName: e.target.value })}
                        placeholder={t('invoicing.customerName')}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="paymentMethod">{t('invoicing.paymentMethod')}</Label>
                      <Select
                        value={receiptFormData.paymentMethod}
                        onValueChange={(value: "cash" | "card" | "transfer") => 
                          setReceiptFormData({ ...receiptFormData, paymentMethod: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">{t('invoicing.cash')}</SelectItem>
                          <SelectItem value="card">{t('invoicing.card')}</SelectItem>
                          <SelectItem value="transfer">{t('invoicing.transfer')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="receiptNotes">{t('common.notes')}</Label>
                      <Textarea
                        id="receiptNotes"
                        value={receiptFormData.notes}
                        onChange={(e) => setReceiptFormData({ ...receiptFormData, notes: e.target.value })}
                        placeholder={t('invoicing.thankYouMessage')}
                        rows={2}
                      />
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">{t('invoicing.receiptItems')}</h3>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
                          <div className="grid gap-2">
                            <Label htmlFor="receiptItemName">{t('invoicing.itemName')}</Label>
                            <Input
                              id="receiptItemName"
                              value={receiptFormData.itemName}
                              onChange={(e) => setReceiptFormData({ ...receiptFormData, itemName: e.target.value })}
                              placeholder={t('invoicing.productOrService')}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="receiptItemQuantity">{t('invoicing.qty')}</Label>
                            <Input
                              id="receiptItemQuantity"
                              type="number"
                              min="1"
                              value={receiptFormData.itemQuantity}
                              onChange={(e) => setReceiptFormData({ ...receiptFormData, itemQuantity: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="receiptItemPrice">{t('invoicing.price')}</Label>
                            <Input
                              id="receiptItemPrice"
                              type="number"
                              step="0.01"
                              min="0"
                              value={receiptFormData.itemPrice}
                              onChange={(e) => setReceiptFormData({ ...receiptFormData, itemPrice: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                          <Button type="button" onClick={handleAddReceiptItem} size="icon">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {receiptItems.length > 0 && (
                          <div className="border rounded-lg p-3 space-y-2">
                            {receiptItems.map((item, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span className="flex-1">{item.name}</span>
                                <span className="text-muted-foreground mx-2">×{item.quantity}</span>
                                <span className="font-medium min-w-[80px] text-right">
                                  {format(item.quantity * item.price)}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 ml-2"
                                  onClick={() => handleRemoveReceiptItem(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                            <div className="border-t pt-2 flex justify-between font-semibold">
                              <span>{t('common.total')}:</span>
                              <span>{format(calculateReceiptTotal())}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={receiptItems.length === 0}>
                      {t('invoicing.createReceipt')}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "invoices"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("invoices")}
          >
            {t('nav.invoices')} ({invoices.length})
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "receipts"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("receipts")}
          >
            {t('invoicing.receipts')} ({receipts.length})
          </button>
        </div>

        {/* Stats Cards */}
        {activeTab === "invoices" ? (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t('common.total')}</p>
                  <p className="text-lg font-bold text-foreground">{format(invoiceStats.total)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t('invoicing.paid')}</p>
                  <p className="text-lg font-bold text-success">{format(invoiceStats.paid)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t('invoicing.pending')}</p>
                  <p className="text-lg font-bold text-warning">{format(invoiceStats.pending)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t('invoicing.totalSales')}</p>
                  <p className="text-lg font-bold text-foreground">{format(receiptStats.total)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t('invoicing.receipts')}</p>
                  <p className="text-lg font-bold text-foreground">{receiptStats.count}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Banner */}
        {showHelp && (
          <Alert className="mb-6 bg-primary/5 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <strong className="block mb-1">{t('invoicing.tutorialMode')}</strong>
                {activeTab === "invoices" 
                  ? t('invoicing.invoiceTutorial')
                  : t('invoicing.receiptTutorial')}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mt-1"
                onClick={() => setShowHelp(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Content based on active tab */}
        {activeTab === "invoices" ? (
          invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('invoicing.noInvoices')}</h3>
              <p className="text-muted-foreground mb-4">{t('invoicing.createFirstInvoice')}</p>
            </div>
          ) : (
          <div className="grid gap-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-card-foreground">
                          {invoice.invoiceNumber}
                        </h3>
                        <Badge variant="outline" className={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        {!invoice.synced && (
                          <Badge variant="outline" className="text-xs">{t('common.pendingSync')}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                      <p className="text-xs text-muted-foreground">{invoice.customerEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{format(invoice.total)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{t('common.date')}: {invoice.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{t('invoicing.due')}: {invoice.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewingInvoice(invoice)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('common.view')}
                    </Button>
                    <Select
                      value={invoice.status}
                      onValueChange={(value) => handleStatusChange(invoice.id, value as LocalInvoice["status"])}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t('invoicing.pending')}</SelectItem>
                        <SelectItem value="paid">{t('invoicing.paid')}</SelectItem>
                        <SelectItem value="overdue">{t('invoicing.overdue')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(invoice.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )
        ) : (
          receipts.length === 0 ? (
            <div className="text-center py-12">
              <ReceiptIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('invoicing.noReceipts')}</h3>
              <p className="text-muted-foreground mb-4">{t('invoicing.createFirstReceipt')}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {receipts.map((receipt) => (
                <Card key={receipt.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-card-foreground mb-1">
                          {receipt.receiptNumber}
                        </h3>
                        {receipt.customerName && (
                          <p className="text-sm text-muted-foreground">{receipt.customerName}</p>
                        )}
                        <p className="text-xs text-muted-foreground capitalize">
                          {t('invoicing.paidBy')} {receipt.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">{format(receipt.total)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{t('common.date')}: {receipt.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{receipt.items.length} {t('invoicing.items')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setViewingReceipt(receipt)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('common.view')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteReceipt(receipt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        )}

        {/* View Invoice Dialog */}
        <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            {viewingInvoice && (
              <>
                <DialogHeader>
                  <DialogTitle>{t('invoicing.invoicePreview')}</DialogTitle>
                </DialogHeader>
                <div ref={invoiceRef} className="bg-gray-50 p-4 rounded-lg">
                  <InvoicePreview
                    invoice={viewingInvoice}
                    template={templates.find(t => t.id === viewingInvoice.templateId) || templates[0]}
                  />
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* View Receipt Dialog */}
        <Dialog open={!!viewingReceipt} onOpenChange={() => setViewingReceipt(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {viewingReceipt && (
              <>
                <DialogHeader>
                  <DialogTitle>{t('invoicing.receiptPreview')}</DialogTitle>
                </DialogHeader>
                <div ref={receiptRef} className="bg-gray-50 p-4 rounded-lg">
                  <ReceiptPreview
                    receipt={viewingReceipt}
                    template={templates[0]}
                  />
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Template Editor */}
        <TemplateEditor
          template={editingTemplate}
          open={isTemplateEditorOpen}
          onOpenChange={setIsTemplateEditorOpen}
          onSave={handleTemplateSave}
        />
      </div>
    </div>
  );
};

export default Invoicing;
