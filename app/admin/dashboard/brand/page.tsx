'use client';
import { useState, useEffect } from 'react';

interface Brand {
  _id: string;
  name: string;
}

export default function BrandPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    const res = await fetch('/api/admin/brand');
    const data = await res.json();
    setBrands(data.brands);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = '/api/admin/brand';
    const method = editId ? 'PUT' : 'POST';
    const body = editId 
      ? JSON.stringify({ id: editId, name })
      : JSON.stringify({ name });

    await fetch(url, { method, body, headers: { 'Content-Type': 'application/json' } });
    setName('');
    setEditId(null);
    fetchBrands();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/admin/brand', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' }
    });
    fetchBrands();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Brand Management</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Brand Name"
            className="border p-2 rounded text-black"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editId ? 'Update' : 'Add'} Brand
          </button>
        </div>
      </form>

      <div className="grid gap-4 bg-white">
        {brands.map((brand) => (
          <div key={brand._id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <h3 className="font-bold text-black">{brand.name}</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditId(brand._id);
                  setName(brand.name);
                }}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(brand._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
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
