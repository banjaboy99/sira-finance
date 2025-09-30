import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Globe, Bell, Shield, Download, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load settings
    const setupData = localStorage.getItem("businessSetup");
    if (setupData) {
      const data = JSON.parse(setupData);
      setBusinessName(data.businessName || "");
      setCurrency(data.currency || "NGN");
    }
  }, []);

  const handleSave = () => {
    const setupData = JSON.parse(localStorage.getItem("businessSetup") || "{}");
    setupData.businessName = businessName;
    setupData.currency = currency;
    localStorage.setItem("businessSetup", JSON.stringify(setupData));

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };

  const handleExport = () => {
    toast({
      title: "Coming soon!",
      description: "Google Drive backup will be available once Cloud is enabled",
    });
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.clear();
      toast({
        title: "Data cleared",
        description: "All local data has been removed",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background pb-20 md:pb-6">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Profile</CardTitle>
              </div>
              <CardDescription>Update your business information</CardDescription>
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
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle>Language & Region</CardTitle>
              </div>
              <CardDescription>Choose your preferred language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="yo">Yoruba</SelectItem>
                    <SelectItem value="ig">Igbo</SelectItem>
                    <SelectItem value="ha">Hausa</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts for orders and low stock</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
            </CardContent>
          </Card>

          {/* Data & Security */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Data & Security</CardTitle>
              </div>
              <CardDescription>Manage your data and backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Backup to Google Drive
              </Button>
              <Button variant="destructive" className="w-full justify-start" onClick={handleClearData}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
