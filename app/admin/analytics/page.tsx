'use client';

import { useEffect, useState } from 'react';
import { FiUsers, FiMessageSquare, FiClock } from 'react-icons/fi';

interface StatCardProps {
  title: string;
  value: number;
  change: string;
  icon: React.ReactNode;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    userCount: 0,
    conversationCount: 0,
    sessionCount: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin?resource=stats');
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats({
          userCount: data.userCount || 0,
          conversationCount: data.conversationCount || 0,
          sessionCount: data.sessionCount || 0,
        });
      } catch (e) {
        console.error('Failed to fetch stats:', e);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="flex-1 p-8 overflow-auto">
      <h1 className="text-3xl font-bold mb-8">Analytics Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Users"
          value={stats.userCount}
          change="↑ 12% from last month"
          icon={<FiUsers />}
        />
        <StatCard
          title="Total Conversations"
          value={stats.conversationCount}
          change="↑ 8% from last month"
          icon={<FiMessageSquare />}
        />
        <StatCard
          title="Available Sessions"
          value={stats.sessionCount}
          change="↑ 5% from last month"
          icon={<FiClock />}
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center">
      <div className="bg-blue-100 p-3 rounded-full text-blue-600 mr-4">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-green-600 mt-1">{change}</p>
      </div>
    </div>
  );
}
