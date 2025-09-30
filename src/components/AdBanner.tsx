import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const AdBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <Card className="relative bg-gradient-to-r from-muted/50 to-muted border-border overflow-hidden">
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">Advertisement</p>
          <p className="text-xs text-muted-foreground">
            Ad space - Support the app by viewing ads
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
