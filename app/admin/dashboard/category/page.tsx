"use client";
import { AnyARecord } from "dns";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  type: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("consumable");
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/category");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, type }),
      });

      if (response.ok) {
        toast.success("Category created successfully");
        setName("");
        fetchCategories();
      } else {
        toast.error("Failed to create category");
      }
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  // Update category
  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch("/api/admin/category", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name: editName,
          type: editType,
        }),
      });

      if (response.ok) {
        toast.success("Category updated successfully");
        setEditMode(null);
        fetchCategories();
      } else {
        toast.error("Failed to update category");
      }
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  // Delete category
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? This will also delete all related subcategories.")) {
      try {
        const response = await fetch(`/api/admin/category?id=${id}`, {
          method: "DELETE",
        });
        const data: any = await response.json();
        if (response.ok) {
          toast.success(data.message);
          fetchCategories();
        } else {
          toast.error("Failed to delete category");
        }
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>

      {/* Create Category Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block mb-2">Category Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full max-w-md text-black"
            required
          />
        </div>

        <div>
          <label className="block mb-2">Type:</label>
          <div className="space-x-4">
            <label>
              <input
                type="radio"
                value="consumable"
                checked={type === "consumable"}
                onChange={(e) => setType(e.target.value)}
                className="mr-2 text-black"
              />
              Consumable
            </label>
            <label>
              <input
                type="radio"
                value="non-consumable"
                checked={type === "non-consumable"}
                onChange={(e) => setType(e.target.value)}
                className="mr-2 text-black"
              />
              Non-Consumable
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Category
        </button>
      </form>

      {/* Categories Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b text-black">Name</th>
              <th className="px-6 py-3 border-b text-black">Type</th>
              <th className="px-6 py-3 border-b text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category._id}>
                <td className="px-6 py-4 border-b text-black">
                  {editMode === category._id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border p-1 rounded text-black"
                    />
                  ) : (
                    category.name
                  )}
                </td>
                <td className="px-6 py-4 border-b text-black">
                  {editMode === category._id ? (
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      className="border p-1 rounded text-black"
                    >
                      <option className="text-black" value="consumable">Consumable</option>
                      <option className="text-black" value="non-consumable">Non-Consumable</option>
                    </select>
                  ) : (
                    category.type
                  )}
                </td>
                <td className="px-6 py-4 border-b">
                  {editMode === category._id ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdate(category._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditMode(null)}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => {
                          setEditMode(category._id);
                          setEditName(category.name);
                          setEditType(category.type);
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
