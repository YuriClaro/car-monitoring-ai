"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ImagePlus, MessageSquare, Plus, Search, Send, Trash2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/hooks/useMessages";
import { createClient } from "@/lib/supabase/client";

export default function AICarPage() {
  const supabase = createClient();
  const {
    data: { publicUrl: openAiLightLogoUrl },
  } = supabase.storage
    .from("logo-site")
    .getPublicUrl("gpt-logo/open-ai-light-logo.png");

  const {
    data: { publicUrl: openAiDarkLogoUrl },
  } = supabase.storage
    .from("logo-site")
    .getPublicUrl("gpt-logo/open-ai-dark-logo.png");

  const {
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
  } = useMessages();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [question, setQuestion] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = question.trim();
    if (!value && attachedImages.length === 0) return;

    setQuestion("");
    await sendMessage(value, attachedImages);
    setAttachedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePickImages = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);

    const validFiles = Array.from(files).filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isUnder10Mb = file.size <= 10 * 1024 * 1024;
      return isImage && isUnder10Mb;
    });

    if (validFiles.length !== files.length) {
      setUploadError("Some files were ignored. Please use images up to 10MB.");
    }

    const dataUrls = await Promise.all(
      validFiles.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("Failed to read image"));
            reader.readAsDataURL(file);
          })
      )
    );

    setAttachedImages((prev) => [...prev, ...dataUrls].slice(0, 4));
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, current) => current !== index));
  };

  const formatConversationDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const filteredConversations = conversations.filter((conversation) => {
    if (!searchTerm.trim()) {
      return true;
    }

    const haystack = `${conversation.title} ${conversation.preview}`.toLowerCase();
    return haystack.includes(searchTerm.trim().toLowerCase());
  });

  const handleDeleteConversation = async (targetConversationId: string) => {
    const confirmed = window.confirm("Delete this conversation? This action cannot be undone.");
    if (!confirmed) {
      return;
    }

    try {
      await deleteConversation(targetConversationId);
    } catch (err) {
      console.error("Delete conversation error:", err);
    }
  };

  return (
    <section className="mx-auto flex h-full w-full max-w-6xl flex-col p-6">
      <div className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <img
            src={openAiLightLogoUrl}
            alt="OpenAI logo for light mode"
            className="h-6 w-6 object-contain dark:hidden"
          />
          <img
            src={openAiDarkLogoUrl}
            alt="OpenAI logo for dark mode"
            className="hidden h-6 w-6 object-contain dark:block"
          />
          <span>CarGPT</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Chat with AI for maintenance insights and car care guidance.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <aside className="hidden w-72 flex-col rounded-lg border bg-card md:flex">
          <div className="border-b p-3">
            <Button className="w-full justify-start gap-2" onClick={startNewConversation}>
              <Plus size={16} />
              New chat
            </Button>

            <div className="relative mt-2">
              <Search
                size={14}
                className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search conversation"
                className="h-9 w-full rounded-md border border-input bg-background pl-7 pr-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {isLoadingConversations ? (
              <p className="px-2 py-1 text-xs text-muted-foreground">Loading...</p>
            ) : null}

            {!isLoadingConversations && filteredConversations.length === 0 ? (
              <p className="px-2 py-1 text-xs text-muted-foreground">
                No conversations found.
              </p>
            ) : null}

            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`w-full rounded-md border px-3 py-2 text-left transition-colors ${
                  conversationId === conversation.id
                    ? "border-primary bg-primary/10"
                    : "border-transparent hover:bg-muted"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => selectConversation(conversation.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-sm font-medium">{conversation.title}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {conversation.preview || "No messages"}
                    </p>
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {formatConversationDate(conversation.updatedAt)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteConversation(conversation.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
                      aria-label="Delete conversation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card">
          <div className="border-b p-3 md:hidden">
            <Button className="w-full justify-start gap-2" onClick={startNewConversation}>
              <Plus size={16} />
              Nova conversa
            </Button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&_code]:rounded [&_code]:bg-background/60 [&_code]:px-1.5 [&_code]:py-0.5 [&_li]:my-0.5 [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-background/60 [&_pre]:p-3">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {message.content ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : null}
                      {message.imageDataUrls?.length ? (
                        <div className="grid grid-cols-2 gap-2">
                          {message.imageDataUrls.map((imageUrl, imageIndex) => (
                            <img
                              key={`${message.id}-${imageIndex}`}
                              src={imageUrl}
                              alt="Attached image"
                              className="h-24 w-full rounded-md border object-cover"
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading ? (
              <div className="text-sm text-muted-foreground">AI is thinking...</div>
            ) : null}

            {error ? (
              <div className="rounded-md border border-red-400/40 bg-red-950/20 p-3 text-sm text-red-300">
                {error}
              </div>
            ) : null}

            {conversationId ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare size={14} />
                Conversation ID: {conversationId}
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t p-4">
            {attachedImages.length > 0 ? (
              <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {attachedImages.map((imageUrl, index) => (
                  <div key={`preview-${index}`} className="relative">
                    <img
                      src={imageUrl}
                      alt={`Preview ${index + 1}`}
                      className="h-20 w-full rounded-md border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                      aria-label="Remove image"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {uploadError ? (
              <div className="mb-3 rounded-md border border-yellow-500/40 bg-yellow-900/30 px-3 py-2 text-xs text-yellow-200">
                {uploadError}
              </div>
            ) : null}

            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFilesSelected}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handlePickImages}
                disabled={isLoading}
                aria-label="Attach images"
              >
                <ImagePlus size={16} />
              </Button>
              <input
                ref={inputRef}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Describe the issue or send only images for analysis"
                disabled={isLoading}
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
              />
              <Button
                type="submit"
                disabled={isLoading || (!question.trim() && attachedImages.length === 0)}
              >
                <Send size={16} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
