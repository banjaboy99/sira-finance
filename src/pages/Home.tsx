import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Package, FileText, Users, ArrowRight, TrendingUp, AlertCircle, DollarSign, ShoppingCart, Menu, User, Settings as SettingsIcon, PieChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdBanner } from "@/components/AdBanner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Home = () => {
  const [greeting, setGreeting] = useState("Welcome");
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    // Load business name
    const setupData = localStorage.getItem("businessSetup");
    if (setupData) {
      const data = JSON.parse(setupData);
      setBusinessName(data.businessName || "");
    }

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const features = [
    {
      title: "Inventory",
      description: "Track stock levels and manage items",
      icon: Package,
      path: "/inventory",
      color: "from-primary/20 to-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Invoicing",
      description: "Create professional invoices",
      icon: FileText,
      path: "/invoicing",
      color: "from-accent/20 to-accent/10",
      iconColor: "text-accent",
    },
    {
      title: "Suppliers",
      description: "Manage your supplier contacts",
      icon: Users,
      path: "/suppliers",
      color: "from-secondary/20 to-secondary/10",
      iconColor: "text-secondary",
    },
  ];

  const stats = [
    {
      label: "Total Items",
      value: "0",
      icon: ShoppingCart,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Pending Invoices",
      value: "0",
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Active Suppliers",
      value: "0",
      icon: Users,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      label: "Low Stock Items",
      value: "0",
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
        {/* Header with Menu */}
        <div className="flex items-start justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {greeting}
              {businessName && (
                <span className="block md:inline md:ml-2 text-primary">
                  {businessName}
                </span>
              )}
            </h1>
            <p className="text-muted-foreground">Here's what's happening with your business today</p>
          </div>

          {/* Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card z-50">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/finances" className="flex items-center cursor-pointer">
                  <PieChart className="mr-2 h-4 w-4" />
                  <span>Finances</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center cursor-pointer">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Ad Banner */}
        <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <AdBanner />
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {stats.map((stat, idx) => (
            <Card key={stat.label} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-3 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {features.map((feature) => (
              <Link key={feature.path} to={feature.path} className="group">
                <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1">
                  <CardHeader>
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}>
                      <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="w-full justify-between group/btn">
                      Open
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
          <Card>
            <CardContent className="py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No recent activity yet</p>
              <p className="text-sm text-muted-foreground">
                Start by adding inventory items or creating your first invoice
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
