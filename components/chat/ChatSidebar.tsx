"use client";

import { MessageCircle, X, Send } from "lucide-react";
import { FormEvent, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/hooks/useMessages";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const { messages, isLoading, error, sendMessage } = useMessages();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputRef.current?.value.trim()) return;

    const userMessage = inputRef.current.value;
    inputRef.current.value = "";

    await sendMessage(userMessage);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-primary p-3 text-primary-foreground shadow-lg transition-all hover:scale-110"
        aria-label="Open AI chat"
      >
        <MessageCircle size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Chat Panel */}
      <div
        className={`fixed right-0 top-0 z-40 h-screen w-full max-w-md transform bg-background shadow-lg transition-transform duration-300 ease-in-out md:max-w-sm ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Car Assistant</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    <div className="animation-delay-100 h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    <div className="animation-delay-200 h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask a question..."
                disabled={isLoading}
                className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
              >
                <Send size={18} />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
