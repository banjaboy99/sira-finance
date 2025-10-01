import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Globe, Bell, Shield, Download, Trash2, Moon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import { BackButton } from "@/components/BackButton";

const Settings = () => {
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [invoiceReminders, setInvoiceReminders] = useState(true);

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
    <div className="min-h-screen bg-background">
      <BackButton title="Settings" subtitle="Manage your app preferences and settings" to="/" />
      <div className="container mx-auto px-4 py-8 max-w-2xl pb-20 md:pb-6">

        <div className="space-y-6">
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
                <label className="text-sm font-medium">Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
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

          {/* Appearance */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-primary" />
                <CardTitle>Appearance</CardTitle>
              </div>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
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
                  <p className="text-sm text-muted-foreground">Receive general alerts</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Low Stock Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when stock is low</p>
                </div>
                <Switch checked={lowStockAlerts} onCheckedChange={setLowStockAlerts} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Invoice Reminders</p>
                  <p className="text-sm text-muted-foreground">Reminders for pending invoices</p>
                </div>
                <Switch checked={invoiceReminders} onCheckedChange={setInvoiceReminders} />
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

