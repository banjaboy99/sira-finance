import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InventoryItemType } from "./InventoryItem";

interface AddItemDialogProps {
  onAdd: (item: Omit<InventoryItemType, "id">) => void;
  editItem?: InventoryItemType | null;
  onUpdate?: (item: InventoryItemType) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const categories = ["Electronics", "Furniture", "Supplies", "Equipment", "Other"];

export const AddItemDialog = ({ onAdd, editItem, onUpdate, open, onOpenChange }: AddItemDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    quantity: "0",
    category: "",
    minStock: "",
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name,
        sku: editItem.sku,
        quantity: editItem.quantity.toString(),
        category: editItem.category,
        minStock: editItem.minStock?.toString() || "",
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        quantity: "0",
        category: "",
        minStock: "",
      });
    }
  }, [editItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      name: formData.name,
      sku: formData.sku,
      quantity: parseInt(formData.quantity) || 0,
      category: formData.category,
      minStock: formData.minStock ? parseInt(formData.minStock) : undefined,
    };

    if (editItem && onUpdate) {
      onUpdate({ ...itemData, id: editItem.id });
    } else {
      onAdd(itemData);
    }

    setFormData({
      name: "",
      sku: "",
      quantity: "0",
      category: "",
      minStock: "",
    });
    
    const shouldClose = onOpenChange ? false : true;
    if (shouldClose) {
      setIsOpen(false);
    } else {
      onOpenChange?.(false);
    }
  };

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!editItem && (
        <DialogTrigger asChild>
          <Button className="gap-2" size="lg">
            <Plus className="h-5 w-5" />
            Add Item
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Item" : "Add New Item"}</DialogTitle>
            <DialogDescription>
              {editItem ? "Update the item details below." : "Add a new item to your inventory."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter item name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU code"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minStock">Min Stock (Optional)</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{editItem ? "Update Item" : "Add Item"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
