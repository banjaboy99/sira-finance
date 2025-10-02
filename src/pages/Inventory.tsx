import { useState } from "react";
import { Search, Package, Info, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryItem, InventoryItemType } from "@/components/InventoryItem";
import { AddItemDialog } from "@/components/AddItemDialog";
import { useToast } from "@/hooks/use-toast";

const Inventory = () => {
  const { toast } = useToast();
  const [showHelp, setShowHelp] = useState(true);
  const [items, setItems] = useState<InventoryItemType[]>([
    {
      id: "demo-1",
      name: "Sample Product (Click to Edit)",
      sku: "DEMO-001",
      quantity: 25,
      category: "Tutorial",
      minStock: 10,
    },
    {
      id: "demo-2",
      name: "Low Stock Example",
      sku: "DEMO-002",
      quantity: 3,
      category: "Tutorial",
      minStock: 10,
    },
    {
      id: "demo-3",
      name: "Out of Stock Demo",
      sku: "DEMO-003",
      quantity: 0,
      category: "Tutorial",
      minStock: 5,
    },
  ]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingItem, setEditingItem] = useState<InventoryItemType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const categories = ["all", ...Array.from(new Set(items.map((item) => item.category)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (newItem: Omit<InventoryItemType, "id">) => {
    const item: InventoryItemType = {
      ...newItem,
      id: Date.now().toString(),
    };
    setItems([...items, item]);
    toast({
      title: "Item added",
      description: `${item.name} has been added to inventory.`,
    });
  };

  const handleUpdateItem = (updatedItem: InventoryItemType) => {
    setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
    setEditingItem(null);
    setEditDialogOpen(false);
    toast({
      title: "Item updated",
      description: `${updatedItem.name} has been updated.`,
    });
  };

  const handleDeleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    setItems(items.filter((item) => item.id !== id));
    toast({
      title: "Item deleted",
      description: `${item?.name} has been removed from inventory.`,
      variant: "destructive",
    });
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const handleEdit = (item: InventoryItemType) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = items.filter(
    (item) => item.minStock && item.quantity <= item.minStock
  ).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-20 md:pb-6">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="mb-4">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
              <p className="text-sm text-muted-foreground">Stock Management</p>
            </div>
            <div className="flex justify-center">
              <AddItemDialog onAdd={handleAddItem} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Total Items</p>
              <p className="text-2xl font-bold text-foreground">{totalItems}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Low Stock Alerts</p>
              <p className="text-2xl font-bold text-destructive">{lowStockItems}</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Items" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Inventory List */}
      <main className="container mx-auto px-4 py-6">
        {/* Help Banner */}
        {showHelp && (
          <Alert className="mb-6 bg-primary/5 border-primary/20">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <strong className="block mb-1">Tutorial Mode</strong>
                These are example items to show you how inventory tracking works. Click any item to edit, use +/- buttons to adjust quantities, or delete them to start fresh with your own products.
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
        
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start by adding your first inventory item"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <InventoryItem
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDeleteItem}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>
        )}
      </main>

      {/* Edit Dialog */}
      <AddItemDialog
        editItem={editingItem}
        onUpdate={handleUpdateItem}
        onAdd={handleAddItem}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
      />
    </div>
  );
};

export default Inventory;
