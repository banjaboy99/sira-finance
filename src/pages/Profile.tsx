import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Building, MapPin, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { BackButton } from "@/components/BackButton";

const Profile = () => {
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [currency, setCurrency] = useState("NGN");

  useEffect(() => {
    // Load profile data
    const setupData = localStorage.getItem("businessSetup");
    if (setupData) {
      const data = JSON.parse(setupData);
      setBusinessName(data.businessName || "");
      setBusinessType(data.businessType || "");
      setCurrency(data.currency || "NGN");
    }
  }, []);

  const handleSave = () => {
    const setupData = JSON.parse(localStorage.getItem("businessSetup") || "{}");
    setupData.businessName = businessName;
    setupData.businessType = businessType;
    setupData.currency = currency;
    setupData.ownerName = ownerName;
    setupData.email = email;
    setupData.phone = phone;
    setupData.location = location;
    localStorage.setItem("businessSetup", JSON.stringify(setupData));

    toast({
      title: "Profile updated",
      description: "Your profile information has been saved",
    });
  };

  const getInitials = () => {
    if (ownerName) {
      return ownerName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (businessName) {
      return businessName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "BM";
  };

  return (
    <div className="min-h-screen bg-background">
      <BackButton title="Profile" subtitle="Manage your business profile information" to="/" />
      <div className="container mx-auto px-4 py-8 max-w-2xl pb-20 md:pb-6">

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{businessName || "Business Name"}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {businessType ? businessType.replace("-", " ") : "Business Type"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <CardTitle>Business Information</CardTitle>
              </div>
              <CardDescription>Update your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input
                  id="business-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Select value={businessType} onValueChange={setBusinessType}>
                  <SelectTrigger id="business-type">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trader">Market Trader</SelectItem>
                    <SelectItem value="store">Store Owner</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="other">Other Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">🇳🇬 Nigerian Naira (₦)</SelectItem>
                    <SelectItem value="USD">🇺🇸 US Dollar ($)</SelectItem>
                    <SelectItem value="GBP">🇬🇧 British Pound (£)</SelectItem>
                    <SelectItem value="EUR">🇪🇺 Euro (€)</SelectItem>
                    <SelectItem value="GHS">🇬🇭 Ghanaian Cedi (₵)</SelectItem>
                    <SelectItem value="KES">🇰🇪 Kenyan Shilling (KSh)</SelectItem>
                    <SelectItem value="ZAR">🇿🇦 South African Rand (R)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </Label>
                <LocationAutocomplete
                  id="location"
                  value={location}
                  onChange={setLocation}
                  placeholder="Start typing your city..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Personal Information</CardTitle>
              </div>
              <CardDescription>Your contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="owner-name">Full Name</Label>
                <Input
                  id="owner-name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
