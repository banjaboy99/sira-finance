import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, TrendingUp, Users, Shield, ChevronRight, ChevronLeft } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Package,
      title: "Manage Your Business",
      description: "Track inventory, create invoices, and manage suppliers—all in one place.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: TrendingUp,
      title: "Budget Like a Pro",
      description: "See exactly where your money goes with our budget ladder. No more guesswork.",
      color: "bg-accent/10 text-accent",
    },
    {
      icon: Users,
      title: "Never Forget Orders",
      description: "Log special customer orders and get reminded when it's time to deliver.",
      color: "bg-secondary/10 text-secondary",
    },
    {
      icon: Shield,
      title: "Your Data, Secured",
      description: "Automatic backups keep your business safe even when you switch devices.",
      color: "bg-success/10 text-success",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/auth");
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background flex items-center justify-center p-4">
      {/* Language Selector */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Icon */}
            <div className={`h-24 w-24 rounded-2xl ${slides[currentSlide].color} flex items-center justify-center`}>
              {(() => {
                const Icon = slides[currentSlide].icon;
                return <Icon className="h-12 w-12" />;
              })()}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{slides[currentSlide].title}</h2>
              <p className="text-muted-foreground">{slides[currentSlide].description}</p>
            </div>

            {/* Dots */}
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide ? "w-8 bg-primary" : "w-2 bg-border"
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 w-full">
              {currentSlide > 0 && (
                <Button variant="outline" onClick={handlePrev} className="flex-1">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              {currentSlide === 0 && (
                <Button variant="ghost" onClick={handleSkip} className="flex-1">
                  Skip
                </Button>
              )}
              <Button onClick={handleNext} className="flex-1">
                {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                {currentSlide < slides.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
