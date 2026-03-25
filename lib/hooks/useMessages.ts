"use client";

import { useState, useCallback } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageDataUrls?: string[];
};

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! 👋 I am your car assistant. How can I help you?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback(
    (
      role: "user" | "assistant",
      content: string,
      imageDataUrls?: string[]
    ) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      imageDataUrls,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
    },
    []
  );

  const sendMessage = useCallback(
    async (userMessage: string, imageDataUrls: string[] = []) => {
      if (!userMessage.trim() && imageDataUrls.length === 0) return;

      setError(null);
      addMessage("user", userMessage, imageDataUrls);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            userMessage,
            imageDataUrls,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const data = await response.json();
        addMessage("assistant", data.reply);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, addMessage]
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}
