import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { messages, userMessage, imageDataUrls } = await request.json();
    const safeMessages = Array.isArray(messages) ? messages : [];
    const safeImageDataUrls = Array.isArray(imageDataUrls) ? imageDataUrls : [];

    if (!userMessage && safeImageDataUrls.length === 0) {
      return NextResponse.json(
        { error: "Message and image are both empty" },
        { status: 400 }
      );
    }

    // Montar array de mensagens pro OpenAI
    const systemMessage = {
      role: "system" as const,
      content:
        "You are a car maintenance and visual inspection assistant. When images are provided, analyze them and produce an inspection report. Always answer in English and Markdown. Use these sections: ## Summary, ## Visible Findings, ## Severity Level, ## Recommended Actions, ## Notes. In Visible Findings, mention issues such as scratched bumper, dented door, damaged wheel, worn tire, and any other visible damage. If the image is inconclusive, clearly state that. Do not claim certainty without visible evidence.",
    };

    const currentUserMessageContent: Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string; detail: "high" | "low" | "auto" } }
    > = [];

    if (userMessage) {
      currentUserMessageContent.push({ type: "text", text: userMessage });
    }

    if (safeImageDataUrls.length > 0) {
      safeImageDataUrls.forEach((url: string) => {
        currentUserMessageContent.push({
          type: "image_url",
          image_url: { url, detail: "high" },
        });
      });
    }

    if (currentUserMessageContent.length === 0) {
      currentUserMessageContent.push({
        type: "text",
        text: "Analyze the car image and describe visible issues.",
      });
    }

    const openaiMessages = [
      systemMessage,
      ...safeMessages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: currentUserMessageContent,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: openaiMessages as any,
      temperature: 0.3,
      max_tokens: 500,
    });

    const reply = response.choices[0].message.content || "";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}