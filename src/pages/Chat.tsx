"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type Message = {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
};

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = import.meta.env.VITE_GROQ_URL;

export default function Chat() {
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>(() => {
    if (!user?.id) return [{
      id: crypto.randomUUID(),
      content: "Hello! I'm Ami, your AI wellness companion. I'm here to listen, support, and help you navigate your mental health journey. How are you feeling today?",
      sender: "ai",
      timestamp: new Date(),
    }];

    const savedMessages = localStorage.getItem(`chat_messages_${user.id}`);
    return savedMessages ? JSON.parse(savedMessages) : [{
      id: crypto.randomUUID(),
      content: "Hello! I'm Ami, your AI wellness companion. I'm here to listen, support, and help you navigate your mental health journey. How are you feeling today?",
      sender: "ai",
      timestamp: new Date(),
    }];
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "I'm feeling anxious today",
    "I need motivation",
    "Help me relax",
    "I'm stressed about work",
    "I can't sleep well",
    "I'm feeling grateful",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(), 50);
    if (user?.id) {
      localStorage.setItem(`chat_messages_${user.id}`, JSON.stringify(messages));
    }
    return () => clearTimeout(timer);
  }, [messages, user?.id]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      const resp = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            {
              role: "system",
              content: "You are Ami, an empathetic AI companion for a mental wellness app. Only answer questions related to mental wellness, mindfulness, emotional support, and mood tracking.",
            },
            ...messages.slice(-20).map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.content,
            })),
            { role: "user", content: currentInput }
          ],
          temperature: 0.7,
          max_tokens: 512,
        }),
      });

      if (!resp.ok) {
        throw new Error(`Groq API error: ${resp.status}`);
      }

      const data = await resp.json();
      const aiReply = data?.choices?.[0]?.message?.content || "I'm not sure how to answer that.";

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: aiReply,
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error calling Groq API:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: "Sorry, I couldn't connect to the AI service.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: "Connection Error",
        description: "Unable to connect to AI chat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputMessage(reply);
    handleSendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gradient">AI Wellness Companion</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            A safe space to share your thoughts and receive supportive guidance
          </p>
        </div>

        <Card className="wellness-card flex-1 min-h-[750px] max-h-[90vh] flex flex-col shadow-lg border border-gray-200 rounded-xl">
          <CardHeader className="border-b border-border px-6 py-4">
            <CardTitle className="flex items-center text-lg md:text-2xl font-semibold">
              Chat Session
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                End-to-end encrypted
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-5 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "ai" && (
                  <Avatar className="flex-shrink-0">
                    <AvatarImage src="/bot-avatar.png" alt="AI" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl px-6 py-4 text-sm md:text-base leading-relaxed",
                    message.sender === "user"
                      ? "bg-blue-500 text-white ml-4"
                      : "bg-gray-200 text-gray-900 mr-4"
                  )}
                >
                  {message.content}
                  <p className={`text-xs mt-1 ${message.sender === "user" ? "text-white/70" : "text-gray-600"}`}>
                    {formatTime(new Date(message.timestamp))}
                  </p>
                </div>
                {message.sender === "user" && (
                  <Avatar className="flex-shrink-0">
                    <AvatarImage src="/user-avatar.png" alt="You" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-2">
                <Avatar>
                  <AvatarImage src="/bot-avatar.png" alt="AI" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="px-5 py-3 rounded-xl bg-gray-200 text-gray-900 text-sm md:text-base animate-pulse">
                  Typing...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          <div className="px-6 py-4  border-t border-border bg-gray-50">
            <div className="flex flex-wrap gap-3">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="default"
                  onClick={() => handleQuickReply(reply)}
                  className="text-sm p-3"
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-border flex items-center gap-3 bg-white">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Share what's on your mind..."
              className="flex-1 text-sm md:text-base"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              size="icon"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
