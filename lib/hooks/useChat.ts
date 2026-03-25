"use client";

import { useState } from "react";

export function useChat() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const openChat = () => {
    setIsOpen(true);
  };

  return {
    isOpen,
    toggleChat,
    closeChat,
    openChat,
  };
}
