'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
interface MOP {
  _id: string;
  name: string;
}
export default function MOPPage() {
  const [mops, setMops] = useState<MOP[]>([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  useEffect(() => {
    fetchMOPs();
  }, []);
  const fetchMOPs = async () => {
    const res = await fetch('/api/admin/mop');
    const data = await res.json();
    setMops(data.mops);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = '/api/admin/mop';
    const method = editId ? 'PUT' : 'POST';
    const body = editId 
      ? JSON.stringify({ id: editId, name })
      : JSON.stringify({ name });
    try {
      const response = await fetch(url, {
        method,
        body,
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      setName('');
      setEditId(null);
      fetchMOPs();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save Mode of Purchase');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/admin/mop', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
        
      }
      fetchMOPs();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete Mode of Purchase');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mode of Purchase Management</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter Mode of Purchase"
            className="border p-2 rounded flex-grow text-black"
            required
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            {editId ? 'Update' : 'Add'} Method
          </button>
        </div>
      </form>

      <div className="grid gap-4 text-black bg-white">
        {mops.map((mop) => (
          <div key={mop._id} className="border p-4 rounded flex justify-between items-center">
            <div className="font-medium">{mop.name}</div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditId(mop._id);
                  setName(mop.name);
                }}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(mop._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
