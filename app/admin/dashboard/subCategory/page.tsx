"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  type: string;
}

interface SubCategory {
  _id: string;
  name: string;
  categoryId: Category;
}

export default function SubCategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState("consumable");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Fetch categories and subcategories
  const fetchData = async (type?: string) => {
    try {
      const url = type 
        ? `/api/admin/subCategory?type=${type}`
        : '/api/admin/subCategory';
      const response = await fetch(url);
      const data = await response.json();
      setCategories(data.categories);
      setSubCategories(data.subCategories);
    } catch (error) {
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => {
    fetchData(selectedType);
  }, [selectedType]);

  // Handle type change
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setSelectedCategoryId(""); // Reset selected category when type changes
  };

  // Create subcategory
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }
    try {
      const response = await fetch("/api/admin/subCategory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name, 
          categoryId: selectedCategoryId 
        }),
      });

      if (response.ok) {
        toast.success("SubCategory created successfully");
        setName("");
        fetchData(selectedType);
      } else {
        toast.error("Failed to create subcategory");
      }
    } catch (error) {
      toast.error("Failed to create subcategory");
    }
  };

  // Update subcategory
  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch("/api/admin/subCategory", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name: editName,
        }),
      });

      if (response.ok) {
        toast.success("SubCategory updated successfully");
        setEditMode(null);
        fetchData(selectedType);
      } else {
        toast.error("Failed to update subcategory");
      }
    } catch (error) {
      toast.error("Failed to update subcategory");
    }
  };

  // Delete subcategory
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subcategory?")) {
      try {
        const response = await fetch(`/api/admin/subCategory?id=${id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message);
          fetchData(selectedType);
        } else {
          toast.error("Failed to delete subcategory");
        }
      } catch (error) {
        toast.error("Failed to delete subcategory");
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">SubCategory Management</h1>

      {/* Create SubCategory Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block mb-2">SubCategory Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded w-full max-w-md text-black"
            required
          />
        </div>

        <div className="">
          <label className="block mb-2">Category Type:</label>
          <div className="space-x-4">
            <label>
              <input
                type="radio"
                value="consumable"
                checked={selectedType === "consumable"}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="mr-2 text-black"
              />
              Consumable
            </label>
            <label>
              <input
                type="radio"
                value="non-consumable"
                checked={selectedType === "non-consumable"}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="mr-2 text-black"
              />
              Non-Consumable
            </label>
          </div>
        </div>

        <div>
          <label className="block mb-2">Select Category:</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="border p-2 rounded w-full max-w-md text-black"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create SubCategory
        </button>
      </form>

      {/* SubCategories Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b text-black">Name</th>
              <th className="px-6 py-3 border-b text-black">Parent Category</th>
              <th className="px-6 py-3 border-b text-black">Category Type</th>
              <th className="px-6 py-3 border-b text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subCategories.map((subCategory) => (
              <tr key={subCategory._id}>
                <td className="px-6 py-4 border-b text-black">
                  {editMode === subCategory._id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border p-1 rounded"
                    />
                  ) : (
                    subCategory.name
                  )}
                </td>
                <td className="px-6 py-4 border-b text-black">
                  {subCategory.categoryId.name}
                </td>
                <td className="px-6 py-4 border-b text-black">
                  {subCategory.categoryId.type}
                </td>
                <td className="px-6 py-4 border-b text-black">
                  {editMode === subCategory._id ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdate(subCategory._id)}
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
                          setEditMode(subCategory._id);
                          setEditName(subCategory.name);
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDelete(subCategory._id)}
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
