import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type DbMessageRow = {
  id: string;
  role: "user" | "assistant";
  content: string;
  image_data_urls: string[] | null;
  created_at: string;
};

type DbConversationRow = {
  id: string;
  title: string | null;
  created_at: string;
};

type DbConversationMessageRow = {
  conversation_id: string;
  content: string;
  created_at: string;
};

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request: NextRequest) {
  const listMode = request.nextUrl.searchParams.get("list");
  const conversationId = request.nextUrl.searchParams.get("conversationId");
  const query = request.nextUrl.searchParams.get("query")?.trim().toLowerCase();

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server key is not configured" },
      { status: 500 }
    );
  }

  if (listMode === "conversations") {
    const { data: conversationsData, error: conversationsError } = await supabase
      .from("chat_conversations")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (conversationsError) {
      console.error("Conversations fetch error:", conversationsError);
      return NextResponse.json(
        { error: "Failed to load conversations" },
        { status: 500 }
      );
    }

    const { data: recentMessagesData, error: recentMessagesError } =
      await supabase
        .from("chat_messages")
        .select("conversation_id, content, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

    if (recentMessagesError) {
      console.error("Recent messages fetch error:", recentMessagesError);
      return NextResponse.json(
        { error: "Failed to load conversations" },
        { status: 500 }
      );
    }

    const latestMessageByConversation = new Map<string, DbConversationMessageRow>();

    ((recentMessagesData ?? []) as DbConversationMessageRow[]).forEach((row) => {
      if (!latestMessageByConversation.has(row.conversation_id)) {
        latestMessageByConversation.set(row.conversation_id, row);
      }
    });

    const conversations = ((conversationsData ?? []) as DbConversationRow[])
      .map((conversation) => {
        const latestMessage = latestMessageByConversation.get(conversation.id);
        const preview = latestMessage?.content ?? "";
        const fallbackTitle = preview
          ? preview.slice(0, 50)
          : "New conversation";

        return {
          id: conversation.id,
          title: conversation.title || fallbackTitle,
          preview,
          updatedAt: latestMessage?.created_at || conversation.created_at,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

    const filteredConversations = query
      ? conversations.filter((conversation) => {
          const haystack = `${conversation.title} ${conversation.preview}`.toLowerCase();
          return haystack.includes(query);
        })
      : conversations;

    return NextResponse.json({ conversations: filteredConversations });
  }

  if (!conversationId) {
    return NextResponse.json(
      { error: "conversationId is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, image_data_urls, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Chat history fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load chat history" },
      { status: 500 }
    );
  }

  const messages = ((data ?? []) as DbMessageRow[]).map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    imageDataUrls: Array.isArray(message.image_data_urls)
      ? message.image_data_urls
      : undefined,
  }));

  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  try {
    const { messages, userMessage, imageDataUrls, conversationId } =
      await request.json();
    const safeMessages = Array.isArray(messages) ? messages : [];
    const safeImageDataUrls = Array.isArray(imageDataUrls) ? imageDataUrls : [];
    const safeConversationId =
      typeof conversationId === "string" && conversationId.trim().length > 0
        ? conversationId.trim()
        : null;

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase server key is not configured" },
        { status: 500 }
      );
    }

    let activeConversationId = safeConversationId;

    if (!activeConversationId) {
      const firstMessageTitle =
        typeof userMessage === "string" && userMessage.trim().length > 0
          ? userMessage.trim().slice(0, 60)
          : "New conversation";

      const { data: newConversation, error: conversationError } = await supabase
        .from("chat_conversations")
        .insert({ title: firstMessageTitle })
        .select("id")
        .single();

      if (conversationError || !newConversation) {
        console.error("Conversation create error:", conversationError);
        return NextResponse.json(
          { error: "Failed to create conversation" },
          { status: 500 }
        );
      }

      activeConversationId = newConversation.id;
    }

    if (!userMessage && safeImageDataUrls.length === 0) {
      return NextResponse.json(
        { error: "Message and image are both empty" },
        { status: 400 }
      );
    }

    const systemMessage = {
      role: "system" as const,
      content:
        "You are a car diagnostics and maintenance assistant. Analyze the user's text description and infer the most likely issue, " +
        "then provide a practical solution plan. If one or more images are uploaded, also analyze visual evidence and include what is visible " +
        "(for example scratches, dents, wheel damage, tire wear, leaks, warning lights, or broken parts). " +
        "Do not claim certainty without evidence. Distinguish between observed facts and assumptions. " +
        "In Proposed Solution, provide actionable steps from quick checks to repair-level actions.",
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

    const userMessageForStorage =
      typeof userMessage === "string" && userMessage.trim().length > 0
        ? userMessage
        : "[image-only message]";

    const { error: userSaveError } = await supabase.from("chat_messages").insert({
      conversation_id: activeConversationId,
      role: "user",
      content: userMessageForStorage,
      image_data_urls: safeImageDataUrls.length > 0 ? safeImageDataUrls : null,
    });

    if (userSaveError) {
      console.error("User message save error:", userSaveError);
      return NextResponse.json(
        { error: "Failed to save user message" },
        { status: 500 }
      );
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

    const { error: assistantSaveError } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: activeConversationId,
        role: "assistant",
        content: reply,
        image_data_urls: null,
      });

    if (assistantSaveError) {
      console.error("Assistant message save error:", assistantSaveError);
      return NextResponse.json(
        { error: "Failed to save assistant message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply, conversationId: activeConversationId });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { conversationId } = await request.json();
    const safeConversationId =
      typeof conversationId === "string" && conversationId.trim().length > 0
        ? conversationId.trim()
        : null;

    if (!safeConversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase server key is not configured" },
        { status: 500 }
      );
    }

    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", safeConversationId);

    if (error) {
      console.error("Conversation delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete conversation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}