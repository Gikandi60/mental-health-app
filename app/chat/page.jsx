'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSend, FiTrash, FiPlus } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import Link from "next/link";


export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const endOfMessagesRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const newChat = searchParams.get('new') === 'true';
  const conversationId = searchParams.get('id');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/conversations');
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (newChat) {
      setCurrentConversation(null);
    } else if (conversationId) {
      fetchConversation(conversationId);
    }
  }, [newChat, conversationId]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentConversation]);

  const fetchConversation = async (id) => {
    try {
      const response = await fetch(`/api/conversations?id=${id}`);
      const data = await response.json();
      setCurrentConversation(data);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = message.trim();
    setMessage('');
    setLoading(true);
    const timestamp = new Date().toISOString();

    const newMessage = { role: 'user', content: userMessage, createdAt: timestamp };
    const tempConv = {
      id: 'temp',
      title: userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : ''),
      messages: [newMessage],
    };

    let updatedConv = currentConversation
      ? {
          ...currentConversation,
          messages: [...currentConversation.messages, newMessage],
        }
      : tempConv;

    setCurrentConversation(updatedConv);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId: currentConversation?.id === 'temp' ? null : currentConversation?.id,
        }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let assistantMessage = '';

      updatedConv = {
        ...updatedConv,
        messages: [...updatedConv.messages, { role: 'assistant', content: '', createdAt: new Date().toISOString() }],
      };
      setCurrentConversation(updatedConv);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        if (value) {
          const chunk = decoder.decode(value);
          assistantMessage += chunk;

          setCurrentConversation((prev) => {
            const updatedMessages = [...prev.messages];
            updatedMessages[updatedMessages.length - 1].content = assistantMessage;
            return { ...prev, messages: updatedMessages };
          });
        }
        done = readerDone;
      }

      if (!currentConversation || currentConversation.id === 'temp') {
        const response = await fetch('/api/conversations');
        const updatedList = await response.json();
        setConversations(updatedList);
        const newId = updatedList[0]?.id;
        if (newId) router.push(`/chat?id=${newId}`, { scroll: false });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id) => {
    try {
      await fetch('/api/admin?resource=conversations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        router.push('/chat?new=true', { scroll: false });
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-9rem)] flex border rounded-lg overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-gray-50 border-r">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-700">Conversations</h2>
          <button
            onClick={() => router.push('/chat?new=true', { scroll: false })}
            className="text-blue-600 hover:text-blue-800"
            title="Start a new chat"
          >
            <FiPlus />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`flex justify-between items-center px-4 py-3 border-b hover:bg-gray-100 cursor-pointer ${
                  currentConversation?.id === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <button
                  className="flex-1 text-left text-sm font-medium text-gray-700 truncate"
                  onClick={() => router.push(`/chat?id=${conv.id}`, { scroll: false })}
                >
                  {conv.title}
                </button>
                <button
                  className="ml-2 text-gray-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  aria-label="Delete conversation"
                >
                  <FiTrash size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">No conversations yet</div>
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {currentConversation?.messages?.length > 0 ? (
            currentConversation.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-100 text-gray-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="prose prose-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center">
               <Link href="/" className="text-center">
                   <h3 className="text-lg font-medium text-gray-900 cursor-pointer hover:underline">
                 Welcome to Mental Health Support</h3>
                <p className="mt-1 text-sm text-gray-500">
                  How are you feeling today? I'm here to listen and help.
                </p>
                </Link>
              </div>
            
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              <FiSend />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
