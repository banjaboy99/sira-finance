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
import { InvoiceTemplate, DEFAULT_TEMPLATE, Receipt } from "@/types/invoice";
import { InvoicePreview } from "@/components/InvoicePreview";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { TemplateEditor } from "@/components/TemplateEditor";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface Invoice {
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
}

const Invoicing = () => {
  const { toast } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [showHelp, setShowHelp] = useState(true);
  
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([DEFAULT_TEMPLATE]);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate>(DEFAULT_TEMPLATE);
  
  const [activeTab, setActiveTab] = useState<"invoices" | "receipts">("invoices");
  
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "demo-1",
      invoiceNumber: "INV-001",
      customerName: "Example Customer (Click to view)",
      customerEmail: "customer@example.com",
      customerAddress: "123 Example Street, Demo City",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items: [
        { name: "Product A", quantity: 2, price: 50 },
        { name: "Service B", quantity: 1, price: 100 },
      ],
      status: "pending",
      total: 200,
      notes: "This is an example invoice. Create your own by clicking 'New Invoice' button.",
      templateId: "default",
    },
    {
      id: "demo-2",
      invoiceNumber: "INV-002",
      customerName: "Paid Invoice Example",
      customerEmail: "paid@example.com",
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items: [
        { name: "Item X", quantity: 3, price: 25 },
      ],
      status: "paid",
      total: 75,
      notes: "This shows how a paid invoice looks. You can mark invoices as paid after receiving payment.",
      templateId: "default",
    },
  ]);

  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      id: "demo-rec-1",
      receiptNumber: "REC-001",
      customerName: "Walk-in Customer",
      date: new Date().toISOString().split("T")[0],
      items: [
        { name: "Product A", quantity: 1, price: 50 },
        { name: "Product B", quantity: 2, price: 25 },
      ],
      total: 100,
      paymentMethod: "cash",
      notes: "This is an example receipt. Create your own by clicking 'New Receipt' button.",
      templateId: "default",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
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
        title: "Missing information",
        description: "Please fill in item name and price",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (invoiceItems.length === 0) {
      toast({
        title: "No items",
        description: "Please add at least one item to the invoice",
        variant: "destructive",
      });
      return;
    }

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerAddress: formData.customerAddress || undefined,
      date: new Date().toISOString().split("T")[0],
      dueDate: formData.dueDate,
      items: invoiceItems,
      status: "pending",
      total: calculateTotal(),
      notes: formData.notes || undefined,
      templateId: formData.templateId,
    };

    setInvoices([newInvoice, ...invoices]);
    toast({
      title: "Invoice created",
      description: `Invoice ${newInvoice.invoiceNumber} has been created.`,
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
  };

  const handleStatusChange = (id: string, newStatus: Invoice["status"]) => {
    setInvoices(invoices.map(inv => 
      inv.id === id ? { ...inv, status: newStatus } : inv
    ));
    toast({
      title: "Status updated",
      description: `Invoice status changed to ${newStatus}`,
    });
  };

  const handleDelete = (id: string) => {
    const invoice = invoices.find((i) => i.id === id);
    setInvoices(invoices.filter((i) => i.id !== id));
    toast({
      title: "Invoice deleted",
      description: `Invoice ${invoice?.invoiceNumber} has been deleted.`,
      variant: "destructive",
    });
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
        title: "Missing information",
        description: "Please fill in item name and price",
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

  const handleReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (receiptItems.length === 0) {
      toast({
        title: "No items",
        description: "Please add at least one item to the receipt",
        variant: "destructive",
      });
      return;
    }

    const newReceipt: Receipt = {
      id: Date.now().toString(),
      receiptNumber: `REC-${String(receipts.length + 1).padStart(3, "0")}`,
      customerName: receiptFormData.customerName,
      date: new Date().toISOString().split("T")[0],
      items: receiptItems,
      total: calculateReceiptTotal(),
      paymentMethod: receiptFormData.paymentMethod,
      notes: receiptFormData.notes || undefined,
      templateId: "default",
    };

    setReceipts([newReceipt, ...receipts]);
    toast({
      title: "Receipt created",
      description: `Receipt ${newReceipt.receiptNumber} has been created.`,
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
  };

  const handleDeleteReceipt = (id: string) => {
    const receipt = receipts.find((r) => r.id === id);
    setReceipts(receipts.filter((r) => r.id !== id));
    toast({
      title: "Receipt deleted",
      description: `Receipt ${receipt?.receiptNumber} has been deleted.`,
      variant: "destructive",
    });
  };

  const getStatusColor = (status: Invoice["status"]) => {
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Invoicing & Receipts</h1>
            <p className="text-sm text-muted-foreground">
              {invoices.length} invoices · {receipts.length} receipts
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleTemplateEdit}>
              <Settings className="h-5 w-5" />
              Template
            </Button>
            <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" onClick={() => setReceiptItems([])}>
                  <ReceiptIcon className="h-5 w-5" />
                  New Receipt
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleReceiptSubmit}>
                  <DialogHeader>
                    <DialogTitle>Create New Receipt</DialogTitle>
                    <DialogDescription>
                      Add customer details and items to create a receipt
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="receiptCustomerName">Customer Name (Optional)</Label>
                      <Input
                        id="receiptCustomerName"
                        value={receiptFormData.customerName}
                        onChange={(e) => setReceiptFormData({ ...receiptFormData, customerName: e.target.value })}
                        placeholder="Customer Name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
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
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="receiptNotes">Notes (Optional)</Label>
                      <Textarea
                        id="receiptNotes"
                        value={receiptFormData.notes}
                        onChange={(e) => setReceiptFormData({ ...receiptFormData, notes: e.target.value })}
                        placeholder="Thank you message, etc."
                        rows={2}
                      />
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Receipt Items</h3>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
                          <div className="grid gap-2">
                            <Label htmlFor="receiptItemName">Item Name</Label>
                            <Input
                              id="receiptItemName"
                              value={receiptFormData.itemName}
                              onChange={(e) => setReceiptFormData({ ...receiptFormData, itemName: e.target.value })}
                              placeholder="Product or Service"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="receiptItemQuantity">Qty</Label>
                            <Input
                              id="receiptItemQuantity"
                              type="number"
                              min="1"
                              value={receiptFormData.itemQuantity}
                              onChange={(e) => setReceiptFormData({ ...receiptFormData, itemQuantity: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="receiptItemPrice">Price</Label>
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
                                  ${(item.quantity * item.price).toFixed(2)}
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
                              <span>Total:</span>
                              <span>${calculateReceiptTotal().toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={receiptItems.length === 0}>
                      Create Receipt
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={() => setInvoiceItems([])}>
                  <Plus className="h-5 w-5" />
                  New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                      Add customer details and items to create an invoice
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="customerName">Customer Name *</Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="Company or Person Name"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customerEmail">Customer Email *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="customer@email.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="customerAddress">Customer Address (Optional)</Label>
                      <Textarea
                        id="customerAddress"
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                        placeholder="123 Client Street, City, State, ZIP"
                        rows={2}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Payment terms, special instructions, etc."
                        rows={2}
                      />
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Invoice Items</h3>
                      <div className="grid gap-3">
                        <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2 items-end">
                          <div className="grid gap-2">
                            <Label htmlFor="itemName">Item Name</Label>
                            <Input
                              id="itemName"
                              value={formData.itemName}
                              onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                              placeholder="Product or Service"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="itemQuantity">Qty</Label>
                            <Input
                              id="itemQuantity"
                              type="number"
                              min="1"
                              value={formData.itemQuantity}
                              onChange={(e) => setFormData({ ...formData, itemQuantity: e.target.value })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="itemPrice">Price</Label>
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
                                  ${(item.quantity * item.price).toFixed(2)}
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
                              <span>Total:</span>
                              <span>${calculateTotal().toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={invoiceItems.length === 0}>
                      Create Invoice
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
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
            Invoices ({invoices.length})
          </button>
          <button
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "receipts"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("receipts")}
          >
            Receipts ({receipts.length})
          </button>
        </div>

        {/* Stats Cards */}
        {activeTab === "invoices" ? (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="text-lg font-bold text-foreground">${invoiceStats.total.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Paid</p>
                  <p className="text-lg font-bold text-success">${invoiceStats.paid.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Pending</p>
                  <p className="text-lg font-bold text-warning">${invoiceStats.pending.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Sales</p>
                  <p className="text-lg font-bold text-foreground">${receiptStats.total.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Receipts</p>
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
                <strong className="block mb-1">Tutorial Mode</strong>
                {activeTab === "invoices" 
                  ? "These are example invoices to show you how invoicing works. Click 'New Invoice' to create your own, click an invoice to view details, or delete these examples to start fresh."
                  : "These are example receipts to show you how receipt generation works. Click 'New Receipt' to create your own for immediate sales transactions."}
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
              <h3 className="text-lg font-semibold text-foreground mb-2">No invoices yet</h3>
              <p className="text-muted-foreground mb-4">Create your first invoice to get started</p>
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
                      </div>
                      <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                      <p className="text-xs text-muted-foreground">{invoice.customerEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">${invoice.total.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Date: {invoice.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {invoice.dueDate}</span>
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
                      View
                    </Button>
                    <Select
                      value={invoice.status}
                      onValueChange={(value) => handleStatusChange(invoice.id, value as Invoice["status"])}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
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
              <h3 className="text-lg font-semibold text-foreground mb-2">No receipts yet</h3>
              <p className="text-muted-foreground mb-4">Create your first receipt to get started</p>
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
                          Paid by {receipt.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">${receipt.total.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Date: {receipt.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{receipt.items.length} items</span>
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
                        View
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
                  <DialogTitle>Invoice Preview</DialogTitle>
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
                  <DialogTitle>Receipt Preview</DialogTitle>
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
