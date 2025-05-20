import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET: Handles users, conversations, conversation by ID, stats, feedback
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const resource = url.searchParams.get("resource");

    // USERS
    if (resource === "users") {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          _count: {
            select: {
              conversations: true,
              sessions: true,
            },
          },
        },
      });

      const formattedUsers = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: "active",
        sessions: user._count.sessions ?? 0,
        lastActive: new Date(user.createdAt).toLocaleDateString(),
      }));

      return new Response(JSON.stringify(formattedUsers), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // CONVERSATIONS LIST
    if (resource === "conversations") {
      const userId = url.searchParams.get("userId");
      const includeMessages = url.searchParams.get("includeMessages") === "true";

      const conversations = await prisma.conversation.findMany({
        where: userId ? { userId } : undefined,
        orderBy: { updatedAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { messages: true } },
          messages: includeMessages
            ? {
                select: { content: true, createdAt: true },
                orderBy: { createdAt: "asc" },
              }
            : false,
        },
      });

      return new Response(JSON.stringify(conversations), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // SINGLE CONVERSATION
    if (resource === "conversation") {
      const id = url.searchParams.get("id");
      if (!id) {
        return new Response(JSON.stringify({ error: "Conversation ID required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          user: { select: { name: true, email: true } },
          messages: {
            select: { content: true, createdAt: true },
            orderBy: { createdAt: "asc" },
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
    }

    // DASHBOARD STATS
    if (resource === "stats") {
      const userCount = await prisma.user.count();
      const conversationCount = await prisma.conversation.count();
      const messageCount = await prisma.message.count();
      const moodEntryCount = await prisma.moodEntry.count();

      const recentUsers = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, name: true, email: true, createdAt: true },
      });

      const moodData = await prisma.moodEntry.groupBy({
        by: ["mood"],
        _count: true,
      });

      return new Response(
        JSON.stringify({
          userCount,
          conversationCount,
          messageCount,
          moodEntryCount,
          userRetention: 72,
          recentUsers,
          moodData,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // FEEDBACK
    if (resource === "feedback") {
      const mockFeedback = [
        { rating: 5, comment: "Excellent service!", date: "2025-05-15" },
        { rating: 4, comment: "Very helpful", date: "2025-05-13" },
        { rating: 3, comment: "Okay experience", date: "2025-05-10" },
        { rating: 5, comment: "Loved it!", date: "2025-05-08" },
      ];

      return new Response(JSON.stringify(mockFeedback), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid resource" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in admin GET endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: Deletes a user by ID
export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const resource = url.searchParams.get("resource"); // Expected: users/123

    if (!resource?.startsWith("users/")) {
      return new Response(JSON.stringify({ error: "Invalid delete target" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = resource.split("/")[1];
    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return new Response(JSON.stringify({ message: "User deleted" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in DELETE admin endpoint:", error);
    return new Response(JSON.stringify({ error: "Failed to delete user" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await prisma.$disconnect();
  }
}
