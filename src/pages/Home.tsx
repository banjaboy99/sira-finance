import { Link } from "react-router-dom";
import { Package, FileText, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Home = () => {
  const features = [
    {
      title: "Inventory Management",
      description: "Track stock levels, manage items, and get low stock alerts",
      icon: Package,
      path: "/inventory",
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Invoicing",
      description: "Create and manage invoices for your customers",
      icon: FileText,
      path: "/invoicing",
      color: "bg-accent/10 text-accent",
    },
    {
      title: "Suppliers",
      description: "Manage supplier contacts with quick call and WhatsApp access",
      icon: Users,
      path: "/suppliers",
      color: "bg-secondary/10 text-secondary",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
              <Package className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Business Manager</h1>
              <p className="text-muted-foreground">Your all-in-one business toolkit</p>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.path} to={feature.path}>
              <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="w-full justify-between group">
                    Open
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-accent">0</p>
                <p className="text-xs text-muted-foreground">Pending Invoices</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary">0</p>
                <p className="text-xs text-muted-foreground">Active Suppliers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">0</p>
                <p className="text-xs text-muted-foreground">Low Stock Items</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
