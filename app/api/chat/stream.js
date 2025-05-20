import { Groq } from "groq-sdk";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/authOptions";


const prisma = new PrismaClient();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function isRelatedToBhangPsychosis(text) {
  const keywords = [
    "bhang",
    "marijuana",
    "cannabis",
    "weed",
    "psychosis",
    "hallucination",
    "mental illness",
    "substance abuse",
    "paranoia",
    "delusions",
    "drug-induced",
    "schizophrenia",
    "rehab",
    "addiction",
    "mental health after bhang",
    "recovery from bhang",
  ];

  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword));
}

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { message, conversationId } = await req.json();

  // Setup streaming response
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  try {
    if (!isRelatedToBhangPsychosis(message)) {
      const warning =
        "I’m here to support users dealing with psychosis caused by bhang. Please ask something related to that topic.";
      await writer.write(encoder.encode(warning));
      writer.close();
      return new Response(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    // Retrieve or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });

      if (!conversation || conversation.userId !== session.user.id) {
        writer.write(encoder.encode("event: error\ndata: Conversation not found\n\n"));
        writer.close();
        return readable;
      }
    } else {
      conversation = await prisma.conversation.create({
        data: {
          userId: session.user.id,
          title: message.slice(0, 30) + "...",
        },
        include: { messages: true },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        role: "user",
      },
    });

    const chatHistory = conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    chatHistory.push({ role: "user", content: message });

    const systemMessage = {
      role: "system",
      content:
        "You are a supportive mental health chatbot that only answers questions related to psychosis caused by bhang (cannabis use). If a question is not related, kindly respond that you're only able to assist with that topic. You are not a substitute for professional help. Be compassionate, non-judgmental, and factual.",
    };

    let assistantReply = "";

    const stream = await groq.chat.completions.create({
      messages: [systemMessage, ...chatHistory],
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || "";
      assistantReply += token;
      await writer.write(encoder.encode(token));
    }

    // Save assistant message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: assistantReply,
        role: "assistant",
      },
    });

    writer.close();
    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Streaming error:", error);
    await writer.write(encoder.encode("An error occurred."));
    writer.close();
    return new Response(readable);
  }
}
