'use client';
import { useState, useEffect } from 'react';

interface Vendor {
  _id: string;
  vendorId: number;
  name: string;
  address: string;
  mobile: string;
}

export default function VendorPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const res = await fetch('/api/admin/vendor');
    const data = await res.json();
    setVendors(data.vendors);
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setMobile('');
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      alert('Mobile number must be exactly 10 digits');
      return;
    }

    const url = '/api/admin/vendor';
    const method = editId ? 'PUT' : 'POST';
    const body = editId 
      ? JSON.stringify({ id: editId, name, address, mobile })
      : JSON.stringify({ name, address, mobile });

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

      resetForm();
      fetchVendors();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save vendor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;

    try {
      const response = await fetch('/api/admin/vendor', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      fetchVendors();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete vendor');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Vendor Management</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vendor Name"
            className="border p-2 rounded text-black"
            required
          />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            className="border p-2 rounded text-black"
            required
          />
          <input
            type="text"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile Number (10 digits)"
            className="border p-2 rounded text-black"
            required
            pattern="\d{10}"
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            {editId ? 'Update' : 'Add'} Vendor
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-black">
          <thead>
            <tr className="bg-gray-100 text-black">
              <th className="border p-2">Vendor ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Address</th>
              <th className="border p-2">Mobile</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((vendor) => (
              <tr key={vendor._id} className='bg-white text-black'>
                <td className="border p-2 text-center">{vendor.vendorId}</td>
                <td className="border p-2">{vendor.name}</td>
                <td className="border p-2">{vendor.address}</td>
                <td className="border p-2">{vendor.mobile}</td>
                <td className="border p-2">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setEditId(vendor._id);
                        setName(vendor.name);
                        setAddress(vendor.address);
                        setMobile(vendor.mobile);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(vendor._id)}
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
