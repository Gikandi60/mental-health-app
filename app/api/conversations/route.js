import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (id) {
      // Get single conversation with messages
      const conversation = await prisma.conversation.findUnique({
        where: {
          id,
          userId: session.user.id,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
      
      if (!conversation) {
        return new Response(JSON.stringify({ error: "Conversation not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify(conversation), {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      // Get all conversations for user
      const conversations = await prisma.conversation.findMany({
        where: {
          userId: session.user.id,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
      
      return new Response(JSON.stringify(conversations), {
        headers: { "Content-Type": "application/json" },
      });
    }
    
  } catch (error) {
    console.error("Error in conversations endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const { id } = await req.json();
    
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });
    
    if (!conversation || conversation.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    await prisma.conversation.delete({
      where: { id },
    });
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error in conversations endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}