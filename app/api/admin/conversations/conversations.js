import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '@/lib/prisma';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const conversations = await prisma.conversation.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      const formatted = conversations.map(conv => ({
        id: conv.id,
        user: conv.user.name,
        message: conv.message,
        createdAt: conv.createdAt,
      }));

      return res.status(200).json(formatted);
    } catch (error) {
      console.error('[CONVERSATIONS API]', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
