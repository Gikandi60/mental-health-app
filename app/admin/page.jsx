'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiUsers, FiMessageSquare, FiActivity } from 'react-icons/fi';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/admin'); // safer redirect than /admin
        return;
      }
      fetchData();
    } else if (status === 'unauthenticated') {
      router.push('/Adminlogin');
    }
  }, [status, session, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/admin?resource=stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const usersRes = await fetch('/api/admin?resource=users');
      const usersData = await usersRes.json();
      setUsers(usersData);

      const feedbackRes = await fetch('/api/admin?resource=feedback');
      const feedbackData = await feedbackRes.json();
      setFeedback(feedbackData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          + Add New User
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
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
          title="User Retention"
          value={`${stats.userRetention || 72}%`}
          change="↑ 3% from last month"
          icon={<FiActivity />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Users</h2>
            <a href="#" className="text-blue-600 text-sm">View All</a>
          </div>
          <table className="min-w-full">
            <thead>
              <tr className="text-sm text-gray-600">
                <th className="text-left">Name</th>
                <th className="text-left">Status</th>
                <th className="text-left">Sessions</th>
                <th className="text-left">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t text-sm">
                  <td className="py-2">{user.name}</td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.sessions}</td>
                  <td>{user.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Feedback</h2>
            <a href="#" className="text-blue-600 text-sm">View All</a>
          </div>
          <ul className="space-y-4">
            {feedback.map((fb, i) => (
              <li key={i} className="border-b pb-2">
                <div className="flex items-center text-yellow-500 text-sm mb-1">
                  {'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}
                </div>
                <p className="text-sm text-gray-700">{fb.comment}</p>
                <p className="text-xs text-gray-400">{fb.date}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon }) {
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
