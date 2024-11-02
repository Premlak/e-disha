'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  username: string;
  mobileNumber: string;
  address: string;
}

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    username: '',
    mobileNumber: '',
    address: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/user');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editMode ? `/api/admin/user?id=${selectedUser?._id}` : '/api/admin/user';
      const method = editMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success(editMode ? 'User updated successfully' : 'User added successfully');
      setFormData({ username: '', mobileNumber: '', address: '' });
      setEditMode(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const res = await fetch(`/api/admin/user?id=${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="p-4 text-black bg-white">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            placeholder="Username"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            value={formData.mobileNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
            placeholder="Mobile Number"
            pattern="\d{10}"
            title="Mobile number must be 10 digits"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            placeholder="Address"
            className="border p-2 rounded"
            required
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            {editMode ? 'Update User' : 'Add User'}
          </button>
          {editMode && (
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setSelectedUser(null);
                setFormData({ username: '', mobileNumber: '', address: '' });
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Username</th>
              <th className="px-4 py-2 border">Mobile Number</th>
              <th className="px-4 py-2 border">Address</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{user.username}</td>
                <td className="px-4 py-2 border">{user.mobileNumber}</td>
                <td className="px-4 py-2 border">{user.address}</td>
                <td className="px-4 py-2 border">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setEditMode(true);
                        setFormData({
                          username: user.username,
                          mobileNumber: user.mobileNumber,
                          address: user.address
                        });
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
