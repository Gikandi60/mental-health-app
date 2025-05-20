"use client";
import {
  FiUsers,
  FiMessageSquare,
  FiActivity,
  FiUser,
  FiLogOut,
} from 'react-icons/fi';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold text-blue-600 mb-6">Serene</div>
          <nav className="space-y-4 text-gray-700">
            <Link href="/admin" className="flex items-center space-x-2 text-blue-600 font-semibold">
              <FiUsers /> <span>Dashboard</span>
            </Link>
            <Link href="/admin/users" className="flex items-center space-x-2">
              <FiUser /> <span>User Management</span>
            </Link>
            <Link href="/admin/conversations" className="flex items-center space-x-2">
              <FiMessageSquare /> <span>Conversation Logs</span>
            </Link>
            <Link href="/admin/analytics" className="flex items-center space-x-2">
              <FiActivity /> <span>Analytics</span>
            </Link>
          </nav>
        </div>
        <div className="space-y-2">
          <Link href="/admin/profile" className="flex items-center space-x-2 text-gray-600">
            <FiUser /> <span>Profile</span>
          </Link>
          <Link href="/api/auth/signout" className="flex items-center space-x-2 text-red-600">
            <FiLogOut /> <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
