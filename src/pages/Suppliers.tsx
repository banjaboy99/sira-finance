import { useState } from "react";
import { Phone, MessageCircle, Mail, Plus, Edit, Trash2, Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  products: string[];
  address?: string;
  notes?: string;
}

const Suppliers = () => {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "1",
      name: "John Smith",
      company: "Tech Supplies Co.",
      phone: "+1234567890",
      email: "john@techsupplies.com",
      products: ["Laptop Computer", "Printer Paper"],
      address: "123 Business St, City, State 12345",
      notes: "Preferred supplier for electronics",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      company: "Office Furniture Plus",
      phone: "+1987654321",
      email: "sarah@officefurniture.com",
      products: ["Office Chair"],
      address: "456 Commerce Ave, City, State 67890",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    products: "",
    address: "",
    notes: "",
  });

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone: string) => {
    // Remove any non-digit characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const supplierData: Supplier = {
      id: editingSupplier?.id || Date.now().toString(),
      name: formData.name,
      company: formData.company,
      phone: formData.phone,
      email: formData.email,
      products: formData.products.split(",").map(p => p.trim()).filter(p => p),
      address: formData.address || undefined,
      notes: formData.notes || undefined,
    };

    if (editingSupplier) {
      setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? supplierData : s));
      toast({
        title: "Supplier updated",
        description: `${supplierData.name} has been updated.`,
      });
    } else {
      setSuppliers([...suppliers, supplierData]);
      toast({
        title: "Supplier added",
        description: `${supplierData.name} has been added to your contacts.`,
      });
    }

    setFormData({
      name: "",
      company: "",
      phone: "",
      email: "",
      products: "",
      address: "",
      notes: "",
    });
    setEditingSupplier(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      company: supplier.company,
      phone: supplier.phone,
      email: supplier.email,
      products: supplier.products.join(", "),
      address: supplier.address || "",
      notes: supplier.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const supplier = suppliers.find(s => s.id === id);
    setSuppliers(suppliers.filter(s => s.id !== id));
    toast({
      title: "Supplier deleted",
      description: `${supplier?.name} has been removed.`,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Suppliers</h1>
            <p className="text-sm text-muted-foreground">{suppliers.length} total contacts</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => {
                setEditingSupplier(null);
                setFormData({
                  name: "",
                  company: "",
                  phone: "",
                  email: "",
                  products: "",
                  address: "",
                  notes: "",
                });
              }}>
                <Plus className="h-5 w-5" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
                  <DialogDescription>
                    {editingSupplier ? "Update supplier details" : "Add a new supplier contact"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Contact Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="company">Company Name *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="ABC Supplies Inc."
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@company.com"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="products">Products Supplied *</Label>
                    <Input
                      id="products"
                      value={formData.products}
                      onChange={(e) => setFormData({ ...formData, products: e.target.value })}
                      placeholder="Product 1, Product 2, Product 3"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Separate multiple products with commas</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address (Optional)</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Business Street, City, State, ZIP"
                      rows={2}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional information about this supplier..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{editingSupplier ? "Update Supplier" : "Add Supplier"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Suppliers List */}
        {suppliers.length === 0 ? (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No suppliers yet</h3>
            <p className="text-muted-foreground mb-4">Add your first supplier contact to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {suppliers.map((supplier) => (
              <Card key={supplier.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <Building className="h-6 w-6 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-card-foreground">
                          {supplier.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{supplier.company}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(supplier.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  </div>

                  {/* Products */}
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-2">Supplies:</p>
                    <div className="flex flex-wrap gap-1">
                      {supplier.products.map((product, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  {supplier.address && (
                    <p className="text-xs text-muted-foreground mb-3">{supplier.address}</p>
                  )}

                  {/* Notes */}
                  {supplier.notes && (
                    <p className="text-xs text-muted-foreground italic mb-3">{supplier.notes}</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCall(supplier.phone)}
                      className="flex-1 gap-2"
                      variant="default"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                    <Button
                      onClick={() => handleWhatsApp(supplier.phone)}
                      className="flex-1 gap-2 bg-success hover:bg-success/90"
                    >
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button
                      onClick={() => handleEmail(supplier.email)}
                      variant="outline"
                      size="icon"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Suppliers;
