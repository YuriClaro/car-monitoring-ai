"use client";

import { useState, useCallback, useEffect } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageDataUrls?: string[];
};

type ConversationSummary = {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
};

const STORAGE_KEY = "ai-car-conversation-id";

const WELCOME_MESSAGE: Message = {
  id: "1",
  role: "assistant",
  content: "Hello! 👋 I am your car assistant. How can I help you?",
};

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);

    try {
      const response = await fetch("/api/chat?list=conversations");
      if (!response.ok) {
        throw new Error("Failed to load conversations");
      }

      const data = await response.json();
      const list: ConversationSummary[] = Array.isArray(data.conversations)
        ? data.conversations
        : [];

      setConversations(list);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  const loadHistory = useCallback(async (existingConversationId: string) => {
    const response = await fetch(
      `/api/chat?conversationId=${encodeURIComponent(existingConversationId)}`
    );

    if (!response.ok) {
      throw new Error("Failed to load chat history");
    }

    const data = await response.json();
    const history: Message[] = Array.isArray(data.messages) ? data.messages : [];

    setMessages(history.length > 0 ? history : [WELCOME_MESSAGE]);
  }, []);

  useEffect(() => {
    const storedConversationId = localStorage.getItem(STORAGE_KEY);

    loadConversations().catch((err) => {
      console.error("Conversation list load error:", err);
    });

    if (!storedConversationId) {
      return;
    }

    setConversationId(storedConversationId);

    loadHistory(storedConversationId).catch((err) => {
      console.error("History load error:", err);
      setError("Could not load previous conversation");
    });
  }, [loadHistory, loadConversations]);

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
      const currentMessages = [...messages];
      addMessage("user", userMessage, imageDataUrls);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: currentMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            userMessage,
            imageDataUrls,
            conversationId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const data = await response.json();

        if (typeof data.conversationId === "string") {
          setConversationId(data.conversationId);
          localStorage.setItem(STORAGE_KEY, data.conversationId);
        }

        addMessage("assistant", data.reply);
        await loadConversations();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("Error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, addMessage, conversationId, loadConversations]
  );

  const selectConversation = useCallback(
    async (nextConversationId: string) => {
      setError(null);
      setConversationId(nextConversationId);
      localStorage.setItem(STORAGE_KEY, nextConversationId);
      setIsLoading(true);

      try {
        await loadHistory(nextConversationId);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load selected conversation";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [loadHistory]
  );

  const startNewConversation = useCallback(() => {
    setConversationId(null);
    setMessages([WELCOME_MESSAGE]);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const deleteConversation = useCallback(
    async (targetConversationId: string) => {
      const response = await fetch("/api/chat", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversationId: targetConversationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      setConversations((prev) =>
        prev.filter((conversation) => conversation.id !== targetConversationId)
      );

      if (conversationId === targetConversationId) {
        startNewConversation();
      }
    },
    [conversationId, startNewConversation]
  );

  return {
    messages,
    conversationId,
    conversations,
    isLoadingConversations,
    isLoading,
    error,
    sendMessage,
    selectConversation,
    startNewConversation,
    deleteConversation,
  };
}
