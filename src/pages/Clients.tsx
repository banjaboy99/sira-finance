import { useState } from "react";
import { Plus, Search, Mail, Phone, MapPin, Edit, Trash2, UserCheck, Building, Package, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";
import { useOfflineClients } from "@/hooks/useOfflineClients";
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";

const Clients = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { clients, addClient, updateClient, deleteClient, isLoading } = useOfflineClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.company?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingClient) {
        await updateClient(editingClient, {
          name: formData.name,
          company: formData.company || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          address: formData.address || undefined,
          notes: formData.notes || undefined,
        });
        toast({
          title: t('clients.updated'),
          description: `${formData.name} ${t('clients.hasBeenUpdated')}`,
        });
      } else {
        await addClient({
          name: formData.name,
          company: formData.company || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          address: formData.address || undefined,
          notes: formData.notes || undefined,
        });
        toast({
          title: t('clients.added'),
          description: `${formData.name} ${t('clients.hasBeenAdded')}`,
        });
      }

      setFormData({ name: "", company: "", phone: "", email: "", address: "", notes: "" });
      setEditingClient(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('clients.saveFailed'),
        variant: "destructive",
      });
    }
  };

  const handleEdit = (client: typeof clients[0]) => {
    setEditingClient(client.id!);
    setFormData({
      name: client.name,
      company: client.company || "",
      phone: client.phone || "",
      email: client.email || "",
      address: client.address || "",
      notes: client.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteClient(id);
      toast({
        title: t('clients.deleted'),
        description: `${name} ${t('clients.hasBeenRemoved')}`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('clients.deleteFailed'),
        variant: "destructive",
      });
    }
  };

  const handleWhatsApp = (phone: string) => {
    // Remove non-numeric characters except +
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
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
      <BackButton title={t('nav.clients')} subtitle={t('clients.subtitle')} />
      
      <div className="flex items-center justify-between mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingClient(null);
              setFormData({ name: "", company: "", phone: "", email: "", address: "", notes: "" });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              {t('clients.addClient')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingClient ? t('clients.editClient') : t('clients.addClient')}</DialogTitle>
                <DialogDescription>
                  {editingClient ? t('clients.editClientDesc') : t('clients.addClientDesc')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t('clients.clientName')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="company">{t('clients.company')}</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">{t('clients.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+234 123 456 7890"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">{t('clients.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">{t('clients.address')}</Label>
                  <LocationAutocomplete
                    id="address"
                    value={formData.address}
                    onChange={(value) => setFormData({ ...formData, address: value })}
                    placeholder={t('clients.addressPlaceholder')}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">{t('common.notes')}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('clients.notesPlaceholder')}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingClient ? t('clients.updateClient') : t('clients.addClient')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('clients.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="text-center py-12">
          <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery ? t('clients.noClientsFound') : t('clients.noClients')}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery ? t('clients.tryDifferentSearch') : t('clients.addFirstClient')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        {!client.synced && (
                          <Badge variant="outline" className="text-xs">{t('common.pendingSync')}</Badge>
                        )}
                      </div>
                      {client.company && (
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Building className="h-3 w-3" />
                          {client.company}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(client)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(client.id!, client.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {client.email && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {client.email}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => handleEmail(client.email!)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        {t('clients.sendEmail')}
                      </Button>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {client.phone}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => handleCall(client.phone!)}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          {t('clients.call')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleWhatsApp(client.phone!)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {client.address}
                    </div>
                  )}
                  {client.notes && (
                    <p className="text-muted-foreground italic pt-2">{client.notes}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Clients;
