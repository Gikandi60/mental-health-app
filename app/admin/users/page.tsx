'use client';

import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUsers, setShowUsers] = useState(false); // Toggle display

  const fetchUsers = async () => {
    if (showUsers) {
      setShowUsers(false); // hide table
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin?resource=users'); // updated URL
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
      setShowUsers(true); // show table
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };


  const deleteUser = async (id: string) => {
    const confirmDelete = confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin?resource=users/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete user');

      // Update UI
      setUsers(prev => prev.filter(user => user.id !== id));
      setSuccess('User deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete user');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <div className="mb-4">
        <button
          onClick={fetchUsers}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showUsers ? 'Hide Users' : 'Retrieve Users'}
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}
      {loading && <p>Loading users...</p>}

      {showUsers && !loading && (
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Role</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(user => (
                <tr key={user.id} className="border-b">
                  <td className="py-2 px-4">{user.id}</td>
                  <td className="py-2 px-4">{user.name}</td>
                  <td className="py-2 px-4">{user.email}</td>
                  <td className="py-2 px-4">{user.role}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:underline flex items-center space-x-1"
                    >
                      <FiTrash2 /> <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-4 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
