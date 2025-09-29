import { Package, Plus, Minus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface InventoryItemType {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  category: string;
  minStock?: number;
}

interface InventoryItemProps {
  item: InventoryItemType;
  onEdit: (item: InventoryItemType) => void;
  onDelete: (id: string) => void;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
}

export const InventoryItem = ({ item, onEdit, onDelete, onUpdateQuantity }: InventoryItemProps) => {
  const isLowStock = item.minStock && item.quantity <= item.minStock;

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-card-foreground truncate">
                {item.name}
              </h3>
              <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{item.category}</Badge>
            {isLowStock && (
              <Badge variant="destructive" className="text-xs">
                Low Stock
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
              disabled={item.quantity === 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="min-w-[3rem] text-center">
              <span className="text-xl font-bold text-primary">{item.quantity}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
