'use client';

import { useEffect, useState } from 'react';

type User = {
  name: string;
  email: string;
};

type Message = {
  content: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  user: User;
  updatedAt: string;
  _count: {
    messages: number;
  };
  messages?: Message[];
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchConversations() {
      try {
        const res = await fetch('/api/admin?resource=conversations&includeMessages=true');
        if (!res.ok) {
          throw new Error('Unauthorized or failed to fetch');
        }
        const data = await res.json();
        setConversations(data);
      } catch (err) {
        setError('Failed to load conversations. Make sure you are an admin.');
        console.error('Error fetching conversations', err);
      }
    }

    fetchConversations();
  }, []);

  const toggleMessages = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-indigo-700">
        Conversation Logs
      </h1>

      {error && (
        <div className="text-red-500 font-semibold mb-4 text-center">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {conversations.map((conv) => {
          const isExpanded = expandedIds.includes(conv.id);

          return (
            <div
              key={conv.id}
              className="border border-gray-200 shadow-md rounded-xl p-6 bg-white transition-all duration-300"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-semibold text-gray-800">{conv.user.name}</p>
                  <p className="text-sm text-gray-500">{conv.user.email}</p>
                </div>
                <button
                  onClick={() => toggleMessages(conv.id)}
                  className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition"
                >
                  {isExpanded ? 'Hide Messages' : 'View Messages'}
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                Last updated: {new Date(conv.updatedAt).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">
                Total Messages: {conv._count.messages}
              </div>

              {isExpanded && (
                <div className="mt-6 space-y-4 border-t border-gray-100 pt-4">
                  {conv.messages && conv.messages.length > 0 ? (
                    conv.messages.map((message, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md shadow-sm">
                        <p className="text-gray-700">{message.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Sent: {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600">No messages available</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
