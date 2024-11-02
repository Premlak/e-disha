'use client';
import { useState, useEffect } from 'react';

interface Brand {
  _id: string;
  name: string;
}

interface Modal {
  _id: string;
  name: string;
  brandId: Brand;
}

export default function ModalPage() {
  const [modals, setModals] = useState<Modal[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchModals();
    fetchBrands();
  }, []);

  const fetchModals = async () => {
    const res = await fetch('/api/admin/modal');
    const data = await res.json();
    setModals(data.modals);
  };

  const fetchBrands = async () => {
    const res = await fetch('/api/admin/brand');
    const data = await res.json();
    setBrands(data.brands);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = '/api/admin/modal';
    const method = editId ? 'PUT' : 'POST';
    const body = editId 
      ? JSON.stringify({ id: editId, name, brandId })
      : JSON.stringify({ name, brandId });

    await fetch(url, { method, body, headers: { 'Content-Type': 'application/json' } });
    setName('');
    setBrandId('');
    setEditId(null);
    fetchModals();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/admin/modal', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
      headers: { 'Content-Type': 'application/json' }
    });
    fetchModals();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Modal Management</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Modal Name"
            className="border p-2 rounded text-black"
          />
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="border p-2 rounded text-black"
          >
            <option value="">Select Brand</option>
            {brands.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {editId ? 'Update' : 'Add'} Modal
          </button>
        </div>
      </form>

      <div className="grid gap-4 bg-white">
        {modals.map((modal) => (
          <div key={modal._id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <h3 className="font-bold text-black">{modal.name}</h3>
              <p className="text-sm text-black">Brand: {modal.brandId.name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditId(modal._id);
                  setName(modal.name);
                  setBrandId(modal.brandId._id);
                }}
                className="bg-yellow-500 text-white px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(modal._id)}
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
