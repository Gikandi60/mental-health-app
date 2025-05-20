import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/authOptions";


const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const { mood, note } = await req.json();
    
    if (typeof mood !== 'number' || mood < 1 || mood > 5) {
      return new Response(JSON.stringify({ error: "Mood must be between 1 and 5" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const moodEntry = await prisma.moodEntry.create({
      data: {
        userId: session.user.id,
        mood,
        note: note || "",
      },
    });
    
    return new Response(JSON.stringify(moodEntry), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error in mood endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const moodEntries = await prisma.moodEntry.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return new Response(JSON.stringify(moodEntries), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error in mood endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}