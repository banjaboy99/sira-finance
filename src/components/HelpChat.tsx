import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const HelpChat = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your business assistant. I can help you with inventory, invoices, budgets, and more. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");

  // Hide on auth, onboarding, and setup pages
  const hideChat = ['/auth', '/onboarding', '/setup'].includes(location.pathname);
  
  if (hideChat) {
    return null;
  }

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
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: input },
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply || "Sorry, I couldn't generate a response.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      // Remove the user message if request failed
      setMessages((prev) => prev.filter((m) => m !== userMessage));
    } finally {
      setIsLoading(false);
    }
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
            onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
            disabled={isLoading}
          />
          <Button onClick={handleSend} size="icon" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
