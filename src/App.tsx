import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { HelpChat } from "./components/HelpChat";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Setup from "./pages/Setup";
import Settings from "./pages/Settings";
import Inventory from "./pages/Inventory";
import Invoicing from "./pages/Invoicing";
import Suppliers from "./pages/Suppliers";
import Finances from "./pages/Finances";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/" element={<Home />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/invoicing" element={<Invoicing />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <HelpChat />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
