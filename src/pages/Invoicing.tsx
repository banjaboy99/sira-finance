import { useState, useRef } from "react";
import { FileText, Plus, Eye, Trash2, Calendar, Settings, Printer } from "lucide-react";
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
import { InvoiceTemplate, DEFAULT_TEMPLATE } from "@/types/invoice";
import { InvoicePreview } from "@/components/InvoicePreview";
import { TemplateEditor } from "@/components/TemplateEditor";
import { useReactToPrint } from "react-to-print";

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
  const printRef = useRef<HTMLDivElement>(null);
  
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([DEFAULT_TEMPLATE]);
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate>(DEFAULT_TEMPLATE);
  
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "1",
      invoiceNumber: "INV-001",
      customerName: "Acme Corporation",
      customerEmail: "billing@acme.com",
      customerAddress: "456 Client Ave, Business City, BC 67890",
      date: "2025-01-15",
      dueDate: "2025-02-15",
      items: [
        { name: "Laptop Computer", quantity: 2, price: 1200 },
        { name: "Office Chair", quantity: 5, price: 350 },
      ],
      status: "pending",
      total: 4150,
      notes: "Net 30 payment terms. Late fees apply after due date.",
      templateId: "default",
    },
    {
      id: "2",
      invoiceNumber: "INV-002",
      customerName: "Tech Startup Inc.",
      customerEmail: "accounts@techstartup.com",
      date: "2025-01-10",
      dueDate: "2025-01-25",
      items: [
        { name: "Printer Paper", quantity: 50, price: 25 },
      ],
      status: "paid",
      total: 1250,
      templateId: "default",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
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
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

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

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paid: invoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + inv.total, 0),
    pending: invoices.filter(inv => inv.status === "pending").reduce((sum, inv) => sum + inv.total, 0),
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Invoicing</h1>
            <p className="text-sm text-muted-foreground">{invoices.length} total invoices</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleTemplateEdit}>
              <Settings className="h-5 w-5" />
              Template
            </Button>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-lg font-bold text-foreground">${stats.total.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Paid</p>
                <p className="text-lg font-bold text-success">${stats.paid.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Pending</p>
                <p className="text-lg font-bold text-warning">${stats.pending.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        {invoices.length === 0 ? (
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
        )}

        {/* View Invoice Dialog */}
        <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            {viewingInvoice && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Invoice Preview</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrint()}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div ref={printRef} className="bg-gray-50 p-4 rounded-lg">
                  <InvoicePreview
                    invoice={viewingInvoice}
                    template={templates.find(t => t.id === viewingInvoice.templateId) || templates[0]}
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
