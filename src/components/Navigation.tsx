import { Link, useLocation } from "react-router-dom";
import { Package, FileText, Users, Home, PieChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/inventory", icon: Package, label: "Inventory" },
    { path: "/invoicing", icon: FileText, label: "Invoicing" },
    { path: "/suppliers", icon: Users, label: "Suppliers" },
    { path: "/finances", icon: PieChart, label: "Finances" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

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
