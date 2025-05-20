import { Groq } from "groq-sdk";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { message, conversationId } = await req.json();

    // Retrieve or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });

      if (!conversation || conversation.userId !== session.user.id) {
        return new Response(
          JSON.stringify({ error: "Conversation not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
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

    // Save the user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        content: message,
        role: "user",
      },
    });

    // Prepare chat history excluding latest user message (we add it manually)
    const chatHistory = conversation.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // System message to set the assistant's behavior
    const systemMessage = {
      role: "system",
      content:
        "You are Faraja Bot, a supportive and non-judgmental mental health assistant trained to help users understand and cope with psychosis caused by bhang (cannabis) use. You provide compassionate, factual information about the symptoms, causes, risk factors, and management of cannabis-induced psychosis. Topics you may cover include hallucinations, delusions, paranoia, disorganized thinking, confusion, the effects of cannabis on the brain, early warning signs, relapse prevention, and where to seek help. If a user asks a question unrelated to psychosis caused by cannabis use, kindly respond: “I’m here to help only with psychosis caused by bhang (cannabis) use. For other mental health concerns, please consult a different professional resource.” Always make it clear that you are not a licensed medical professional and that users should seek professional help if they are in crisis or need a diagnosis or treatment. Maintain a tone that is kind, respectful, non-judgmental, and easy to understand.",
    };

    // Add the latest user message to chat history
    chatHistory.push({ role: "user", content: message });

    // Create a ReadableStream to stream assistant response chunks
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Initiate streaming completion from Groq API
          const completionStream = await groq.chat.completions.create({
            messages: [systemMessage, ...chatHistory],
            model: "llama3-70b-8192",
            temperature: 0.7,
            max_tokens: 1024,
            stream: true, // Enable streaming
          });

          let assistantResponse = "";

          // Assuming groq returns an async iterator for streaming chunks
          for await (const chunk of completionStream) {
           console.log("Received chunk:", chunk);
            // Each chunk contains partial content
            const contentChunk = chunk.choices[0]?.delta?.content || "";
            assistantResponse += contentChunk;

            // Encode chunk text and enqueue it in the stream
            const encoded = new TextEncoder().encode(contentChunk);
            controller.enqueue(encoded);
          }

          // After streaming is done, save assistant response to DB
          await prisma.message.create({
            data: {
              conversationId: conversation.id,
              content: assistantResponse,
              role: "assistant",
            },
          });

          controller.close();
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no", // For some proxies to disable buffering
      },
    });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
