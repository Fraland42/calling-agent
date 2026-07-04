"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function ChatbotEmbed() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! How can I help you with your real estate needs today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, leadId: leadId || undefined }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        if (data.leadId) setLeadId(data.leadId);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <Card className="w-80 sm:w-96 shadow-xl">
          <CardHeader className="bg-zinc-900 text-white rounded-t-lg py-3">
            <CardTitle className="text-sm font-medium">Real Estate Assistant</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-80 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "ml-auto bg-zinc-900 text-white"
                      : "mr-auto bg-zinc-100 text-zinc-900"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
            <div className="flex items-center gap-2 border-t p-3">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleSend} disabled={isLoading}>
                {isLoading ? "..." : "Send"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Button
        size="icon"
        className="rounded-full h-12 w-12 shadow-lg"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? "✕" : "💬"}
      </Button>
    </div>
  );
}
