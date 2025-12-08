import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { Navigation } from "./components/Navigation";
import { QuickActionsMenu } from "./components/QuickActionsMenu";
import { HelpChat } from "./components/HelpChat";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Setup from "./pages/Setup";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Inventory from "./pages/Inventory";
import Invoicing from "./pages/Invoicing";
import Suppliers from "./pages/Suppliers";
import Clients from "./pages/Clients";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Finances from "./pages/Finances";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <CurrencyProvider>
                <div className="flex flex-col min-h-screen">
                <Navigation onQuickActionsClick={() => setIsQuickActionsOpen(true)} />
                <QuickActionsMenu isOpen={isQuickActionsOpen} onOpenChange={setIsQuickActionsOpen} />
                <main className="flex-1">
                  <Routes>
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/setup" element={<Setup />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/invoicing" element={<Invoicing />} />
                    <Route path="/suppliers" element={<Suppliers />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/finances" element={<Finances />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                  <HelpChat />
                </div>
              </CurrencyProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
