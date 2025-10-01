import { useState } from "react";
import { Plus, Package, FileText, Users, Settings, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  path?: string;
  action?: () => void;
  color: string;
}

const defaultActions: QuickAction[] = [
  { id: "inventory", label: "Add Item", icon: Package, path: "/inventory", color: "text-blue-500" },
  { id: "invoice", label: "New Invoice", icon: FileText, path: "/invoicing", color: "text-green-500" },
  { id: "supplier", label: "Add Supplier", icon: Users, path: "/suppliers", color: "text-purple-500" },
];

export const QuickActionsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [actions] = useState<QuickAction[]>(defaultActions);
  const navigate = useNavigate();

  const handleActionClick = (action: QuickAction) => {
    if (action.path) {
      navigate(action.path);
    }
    if (action.action) {
      action.action();
    }
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg md:bottom-6 z-40 bg-primary hover:bg-primary/90"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Quick Actions
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Choose an action to perform quickly
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleActionClick(action)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                    <Icon className={cn("h-8 w-8", action.color)} />
                    <span className="text-sm font-medium text-center">{action.label}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
