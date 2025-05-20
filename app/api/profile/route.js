import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/authOptions";


const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const profile = await prisma.profileDetail.findUnique({
      where: {
        userId: session.user.id,
      },
    });
    
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        name: true,
        email: true,
      },
    });
    
    return new Response(JSON.stringify({ user, profile }), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error in profile endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const { name, age, preferences, goals } = await req.json();
    
    // Update user name
    if (name) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }
    
    // Update or create profile
    const profile = await prisma.profileDetail.upsert({
      where: { userId: session.user.id },
      update: {
        age: age || undefined,
        preferences: preferences ? JSON.stringify(preferences) : undefined,
        goals: goals ? JSON.stringify(goals) : undefined,
      },
      create: {
        userId: session.user.id,
        age: age || null,
        preferences: preferences ? JSON.stringify(preferences) : null,
        goals: goals ? JSON.stringify(goals) : null,
      },
    });
    
    return new Response(JSON.stringify(profile), {
      headers: { "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error in profile endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}