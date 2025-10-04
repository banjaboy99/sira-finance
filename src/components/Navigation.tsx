import { Link, useLocation } from "react-router-dom";
import { Package, FileText, Users, Home, Plus, UserCheck, Receipt, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

type BusinessType = "trader" | "store" | "freelancer" | "other";

export const Navigation = ({ onQuickActionsClick }: { onQuickActionsClick?: () => void }) => {
  const location = useLocation();
  const [businessType, setBusinessType] = useState<BusinessType>("trader");
  
  useEffect(() => {
    const setupData = localStorage.getItem("businessSetup");
    if (setupData) {
      const data = JSON.parse(setupData);
      setBusinessType(data.businessType || "trader");
    }
  }, []);
  
  // Hide navigation on auth, onboarding, and setup pages
  const hideNavigation = ['/auth', '/onboarding', '/setup', '/profile', '/finances', '/settings'].includes(location.pathname);
  
  if (hideNavigation) {
    return null;
  }
  
  // Dynamic navigation based on business type
  const getNavItems = () => {
    switch (businessType) {
      case "trader":
        return [
          { path: "/", icon: Home, label: "Dashboard" },
          { path: "/invoicing", icon: FileText, label: "Invoices" },
          { path: "/inventory", icon: Package, label: "Inventory" },
          { path: "/suppliers", icon: Users, label: "Suppliers" },
          { path: "/reports", icon: BarChart3, label: "Reports" },
        ];
      
      case "store":
        return [
          { path: "/", icon: Home, label: "Dashboard" },
          { path: "/invoicing", icon: FileText, label: "Invoices" },
          { path: "/inventory", icon: Package, label: "Inventory" },
          { path: "/expenses", icon: Receipt, label: "Expenses" },
          { path: "/reports", icon: BarChart3, label: "Reports" },
        ];
      
      case "freelancer":
        return [
          { path: "/", icon: Home, label: "Dashboard" },
          { path: "/invoicing", icon: FileText, label: "Invoices" },
          { path: "/clients", icon: UserCheck, label: "Clients" },
          { path: "/expenses", icon: Receipt, label: "Expenses" },
          { path: "/reports", icon: BarChart3, label: "Reports" },
        ];
      
      case "other":
      default:
        return [
          { path: "/", icon: Home, label: "Dashboard" },
          { path: "/invoicing", icon: FileText, label: "Invoices" },
          { path: "/inventory", icon: Package, label: "Inventory" },
          { path: "/expenses", icon: Receipt, label: "Expenses" },
          { path: "/reports", icon: BarChart3, label: "Reports" },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50 md:relative md:border-b md:border-t-0">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around md:justify-start md:gap-6 h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "text-primary bg-primary/10 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs md:text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
