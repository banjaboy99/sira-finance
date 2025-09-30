import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const HelpChat = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your business assistant. I can help you with inventory, invoices, budgets, and more. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");

  const quickQuestions = [
    "How do I add inventory?",
    "How to create an invoice?",
    "Track special orders",
    "Set up budget",
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // TODO: Connect to AI when Cloud is enabled
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: getResponse(input),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 500);
  };

  const getResponse = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes("inventory") || q.includes("stock")) {
      return "To add inventory items:\n1. Go to the Inventory page\n2. Click 'Add Item'\n3. Fill in item details (name, quantity, price)\n4. Click Save\n\nYou'll get alerts when stock runs low!";
    }
    
    if (q.includes("invoice")) {
      return "To create an invoice:\n1. Navigate to Invoicing page\n2. Click 'Create Invoice'\n3. Add customer details\n4. Add items from your inventory\n5. Preview and download as PDF\n\nYour invoices look professional!";
    }
    
    if (q.includes("special") || q.includes("order")) {
      return "Special orders help you track customer requests!\n1. Go to Inventory\n2. Click 'Special Orders' tab\n3. Add customer name and item details\n4. Set delivery date\n\nYou'll get reminders when orders are due!";
    }
    
    if (q.includes("budget")) {
      return "Budget management is in the Finances page:\n1. Go to Finances\n2. Click 'Add Budget'\n3. Set category (rent, stock, etc.)\n4. Enter amount\n\nTrack spending vs budget in the Analysis tab!";
    }
    
    return "I can help you with:\n• Adding inventory items\n• Creating invoices\n• Tracking special orders\n• Managing budgets\n• Supplier contacts\n\nWhat would you like to do?";
  };

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-6 h-14 w-14 rounded-full shadow-elevated z-40"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-20 md:bottom-6 right-6 w-[90vw] max-w-md h-[500px] shadow-elevated z-40 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Help Assistant</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 pt-0 gap-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {messages.length === 1 && (
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                onClick={() => handleQuickQuestion(q)}
                className="text-xs"
              >
                {q}
              </Button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
