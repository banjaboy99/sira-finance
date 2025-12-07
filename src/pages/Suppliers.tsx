import { useState } from "react";
import { Phone, MessageCircle, Mail, Plus, Edit, Trash2, Building, Info, X, Package } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { useOfflineSuppliers } from "@/hooks/useOfflineSuppliers";

const Suppliers = () => {
  const { toast } = useToast();
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, isLoading } = useOfflineSuppliers();
  const [showHelp, setShowHelp] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier, {
          name: formData.name,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          address: formData.address || undefined,
          notes: formData.notes || undefined,
        });
        toast({
          title: "Supplier updated",
          description: `${formData.name} has been updated.`,
        });
      } else {
        await addSupplier({
          name: formData.name,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          address: formData.address || undefined,
          notes: formData.notes || undefined,
        });
        toast({
          title: "Supplier added",
          description: `${formData.name} has been added to your contacts.`,
        });
      }

      setFormData({ name: "", phone: "", email: "", address: "", notes: "" });
      setEditingSupplier(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save supplier.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (supplier: typeof suppliers[0]) => {
    setEditingSupplier(supplier.id!);
    setFormData({
      name: supplier.name,
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      notes: supplier.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteSupplier(id);
      toast({
        title: "Supplier deleted",
        description: `${name} has been removed.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete supplier.",
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
                setFormData({ name: "", phone: "", email: "", address: "", notes: "" });
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
                    <Label htmlFor="name">Supplier Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ABC Supplies Inc."
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@company.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Address</Label>
                    <LocationAutocomplete
                      id="address"
                      value={formData.address}
                      onChange={(value) => setFormData({ ...formData, address: value })}
                      placeholder="Start typing an address..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
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

        {/* Help Banner */}
        {showHelp && suppliers.length === 0 && (
          <Alert className="mb-6 bg-primary/5 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <strong className="block mb-1">Get Started</strong>
                Add your supplier contacts to easily reach them via call, WhatsApp, or email.
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
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-card-foreground">
                            {supplier.name}
                          </h3>
                          {!supplier.synced && (
                            <Badge variant="outline" className="text-xs">Pending sync</Badge>
                          )}
                        </div>
                        {supplier.email && (
                          <p className="text-sm text-muted-foreground">{supplier.email}</p>
                        )}
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
                        onClick={() => handleDelete(supplier.id!, supplier.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-3">
                    {supplier.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.address && (
                      <p className="text-xs text-muted-foreground">{supplier.address}</p>
                    )}
                  </div>

                  {/* Notes */}
                  {supplier.notes && (
                    <p className="text-xs text-muted-foreground italic mb-3">{supplier.notes}</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {supplier.phone && (
                      <>
                        <Button
                          onClick={() => handleCall(supplier.phone!)}
                          className="flex-1 gap-2"
                          variant="default"
                        >
                          <Phone className="h-4 w-4" />
                          Call
                        </Button>
                        <Button
                          onClick={() => handleWhatsApp(supplier.phone!)}
                          className="flex-1 gap-2 bg-success hover:bg-success/90"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </Button>
                      </>
                    )}
                    {supplier.email && (
                      <Button
                        onClick={() => handleEmail(supplier.email!)}
                        variant="outline"
                        size={supplier.phone ? "icon" : "default"}
                        className={supplier.phone ? "" : "flex-1 gap-2"}
                      >
                        <Mail className="h-4 w-4" />
                        {!supplier.phone && "Email"}
                      </Button>
                    )}
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
