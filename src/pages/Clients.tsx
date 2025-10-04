import { useState } from "react";
import { Plus, Search, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/BackButton";
import { Badge } from "@/components/ui/badge";

const Clients = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Placeholder data
  const clients = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "+234 123 456 7890",
      location: "Lagos, Nigeria",
      projectCount: 3,
      status: "Active",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <BackButton title="Clients" subtitle="Manage your client relationships" />
      
      <div className="flex items-center justify-between mb-6">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{client.name}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary" className="mt-2">
                      {client.status}
                    </Badge>
                  </CardDescription>
                </div>
                <span className="text-sm text-muted-foreground">
                  {client.projectCount} projects
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {client.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {client.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {client.location}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Clients;
