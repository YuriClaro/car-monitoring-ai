"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { useMessages } from "@/lib/hooks/useMessages";

export default function AICarPage() {
  const { messages, isLoading, error, sendMessage } = useMessages();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [question, setQuestion] = useState("");
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

  return (
    <section className="mx-auto flex h-full w-full max-w-6xl flex-col p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">AI CAR</h1>
        <p className="text-sm text-muted-foreground">
          Chat with AI for maintenance insights and car care guidance.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card">
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
    </section>
  );
}
