import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, Store, Briefcase, Truck, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Setup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  // Form state
  const [businessType, setBusinessType] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [painPoints, setPainPoints] = useState<string[]>([]);

  const businessTypes = [
    { value: "trader", label: "Market Trader", icon: Store, description: "Electronics, clothing, or goods trading" },
    { value: "store", label: "Store Owner", icon: ShoppingBag, description: "Retail shop or mini-supermarket" },
    { value: "freelancer", label: "Freelancer", icon: Briefcase, description: "Designer, developer, creative" },
    { value: "other", label: "Other Business", icon: Truck, description: "Food truck, services, etc." },
  ];

  const painPointOptions = [
    "Track where my money goes",
    "Remember special customer orders",
    "Manage suppliers easily",
    "Create professional invoices",
    "Monitor inventory levels",
    "Budget and plan expenses",
  ];

  const handlePainPointToggle = (point: string) => {
    setPainPoints((prev) =>
      prev.includes(point) ? prev.filter((p) => p !== point) : [...prev, point]
    );
  };

  const handleNext = () => {
    if (step === 1 && !businessType) {
      toast({
        title: "Please select a business type",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && !businessName) {
      toast({
        title: "Please enter your business name",
        variant: "destructive",
      });
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Save setup data
    const setupData = {
      businessType,
      businessName,
      currency,
      painPoints,
      completedAt: new Date().toISOString(),
    };
    localStorage.setItem("businessSetup", JSON.stringify(setupData));
    localStorage.setItem("setupCompleted", "true");

    toast({
      title: "Setup complete!",
      description: "Let's get started with your business",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 4</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 w-8 rounded-full ${s <= step ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && "What describes you best?"}
            {step === 2 && "What's your business name?"}
            {step === 3 && "Choose your currency"}
            {step === 4 && "What do you need help with?"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "We'll customize the app for your needs"}
            {step === 2 && "This will appear on invoices and receipts"}
            {step === 3 && "You can change this later in settings"}
            {step === 4 && "Select all that apply"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Business Type */}
          {step === 1 && (
            <RadioGroup value={businessType} onValueChange={setBusinessType}>
              <div className="space-y-3">
                {businessTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <label
                      key={type.value}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        businessType === type.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={type.value} id={type.value} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </RadioGroup>
          )}

          {/* Step 2: Business Name */}
          {step === 2 && (
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                placeholder="e.g., Baba Yusuf Electronics"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Step 3: Currency */}
          {step === 3 && (
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
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
          )}

          {/* Step 4: Pain Points */}
          {step === 4 && (
            <div className="space-y-3">
              {painPointOptions.map((point) => (
                <label
                  key={point}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    painPoints.includes(point)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={painPoints.includes(point)}
                    onCheckedChange={() => handlePainPointToggle(point)}
                  />
                  <span className="font-medium">{point}</span>
                </label>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {step === 4 ? "Complete Setup" : "Next"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;
