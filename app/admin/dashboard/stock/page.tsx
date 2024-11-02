'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-hot-toast';
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
interface BaseModel {
  _id: string;
  name: string;
}
interface SortConfig {
  key: keyof Product | '';
  direction: 'asc' | 'desc';
}

interface Filters {
  serialNumber: string;
  productNumber: string;
  billNumber: string;
  billDate: string;
}
interface Product {
  _id: string;
  category: BaseModel;
  subCategory: BaseModel;
  brand: BaseModel;
  modal: BaseModel;
  mop: BaseModel;
  vendor: BaseModel;
  serialNumber: string;
  productNumber: string;
  billNumber: string;
  billDate: string;
  issued: boolean;
}
export default function StockPage() {
  const [formData, setFormData] = useState({
    category: '',
    subCategory: '',
    brand: '',
    modal: '',
    mop: '',
    vendor: '',
    serialNumber: '',
    productNumber: '',
    billNumber: '',
    billDate: '',
    issued: false
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
const [filters, setFilters] = useState<Filters>({
  serialNumber: '',
  productNumber: '',
  billNumber: '',
  billDate: ''
});
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [options, setOptions] = useState({
    categories: [] as BaseModel[],
    subCategories: [] as BaseModel[],
    brands: [] as BaseModel[],
    modals: [] as BaseModel[],
    mops: [] as BaseModel[],
    vendors: [] as BaseModel[]
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(5); 
const [dateRange, setDateRange] = useState({
  startDate: '',
  endDate: ''
});
const paginate = (items: Product[]) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  return items.slice(indexOfFirstItem, indexOfLastItem);
};

const PageNumbers = () => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredProducts.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-center gap-2 mt-4">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        Previous
      </button>
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => setCurrentPage(number)}
          className={`px-3 py-1 rounded ${
            currentPage === number
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProducts.length / itemsPerPage)))}
        disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Stock Report', 14, 15);
    
    // Add generation date
    doc.setFontSize(8);
    doc.text(`Generated on: ${format(new Date(), 'dd-MM-yyyy HH:mm')}`, 14, 22);
  
    // Prepare table data
    const tableData = filteredProducts.map(product => [
      product.category.name,
      product.subCategory.name,
      product.brand.name,
      product.modal.name,
      product.mop.name,
      product.vendor.name,
      product.serialNumber,
      product.productNumber,
      product.billNumber,
      format(new Date(product.billDate), 'dd-MM-yy'),
      product.issued ? 'Yes' : 'No'
    ]);
  
    // Add table
    (doc as any).autoTable({
      head: [[
        'Category',
        'Sub Category',
        'Brand',
        'Modal',
        'MOP',
        'Vendor',
        'Serial Number',
        'Product Number',
        'Bill Number',
        'Bill Date',
        'Issued'
      ]],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
  
    // Save PDF
    doc.save(`stock-report-${format(new Date(), 'dd-MM-yyyy-HHmm')}.pdf`);
  };
  
  const handleSort = (key: keyof Product) => {
    setSortConfig(current => {
      if (current.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };
  
  const handleFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Add this useEffect for filtering and sorting
  useEffect(() => {
    let result = [...products];
    if (filters.serialNumber) {
      result = result.filter(product => 
        product.serialNumber.toLowerCase().includes(filters.serialNumber.toLowerCase())
      );
    }
    if (filters.productNumber) {
      result = result.filter(product => 
        product.productNumber.toLowerCase().includes(filters.productNumber.toLowerCase())
      );
    }
    if (filters.billNumber) {
      result = result.filter(product => 
        product.billNumber.toLowerCase().includes(filters.billNumber.toLowerCase())
      );
    }
    if (filters.billDate) {
      result = result.filter(product => 
        product.billDate.includes(filters.billDate)
      );
    }
  
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a: any, b: any) => {
        if (sortConfig.key === 'billDate') {
          const dateA = new Date(a[sortConfig.key]).getTime();
          const dateB = new Date(b[sortConfig.key]).getTime();
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        
        let valueA = a[sortConfig.key];
        let valueB = b[sortConfig.key];
  
        // Handle nested objects (category, subCategory, etc.)
        if (typeof valueA === 'object' && valueA !== null) {
          valueA = valueA.name;
          valueB = valueB.name;
        }
  
        if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the end date fully
  
      result = result.filter(product => {
        const productDate = new Date(product.billDate);
        return productDate >= startDate && productDate <= endDate;
      });
    }
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, filters, sortConfig, dateRange]);
  useEffect(() => {
    fetchInitialData();
  }, []);
  const ProductDetailsModal = ({ product, onClose }: { product: Product; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Product Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><strong>Category:</strong> {product.category.name}</div>
            <div><strong>Sub Category:</strong> {product.subCategory.name}</div>
            <div><strong>Brand:</strong> {product.brand.name}</div>
            <div><strong>Modal:</strong> {product.modal.name}</div>
            <div><strong>MOP:</strong> {product.mop.name}</div>
            <div><strong>Vendor:</strong> {product.vendor.name}</div>
            <div><strong>Serial Number:</strong> {product.serialNumber}</div>
            <div><strong>Product Number:</strong> {product.productNumber}</div>
            <div><strong>Bill Number:</strong> {product.billNumber}</div>
            <div><strong>Bill Date:</strong> {format(new Date(product.billDate), 'dd-MM-yy')}</div>
            <div><strong>Issued:</strong> {product.issued ? 'Yes' : 'No'}</div>
          </div>
          <button
            onClick={onClose}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  };
  const resetFilters = () => {
    // Reset all filters and date range first
    setFilters({
      serialNumber: '',
      productNumber: '',
      billNumber: '',
      billDate: ''
    });
    setDateRange({
      startDate: '',
      endDate: ''
    });
    setSortConfig({ key: '', direction: 'asc' });
    setCurrentPage(1);
    
    // Fetch all products without any filters
    fetch('/api/admin/stock')
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          setProducts(data.products);
          setFilteredProducts(data.products);
        }
      })
      .catch(error => {
        toast.error('Failed to reset products');
        console.error('Error resetting products:', error);
      });
  };
  ;
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`/api/admin/stock`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({id}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to delete product');
      if(data.message == "Deleted"){
        toast.success('Product deleted successfully');
        fetchFilteredProducts();
      }

    } catch (error) {
      toast.error('Failed to delete product');
    }
  };
  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/stock?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
  
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update product');
      }
  
      toast.success('Product updated successfully');
      setEditMode(false);
      setSelectedProduct(null);
      setFormData({
        category: '',
        subCategory: '',
        brand: '',
        modal: '',
        mop: '',
        vendor: '',
        serialNumber: '',
        productNumber: '',
        billNumber: '',
        billDate: '',
        issued: false
      });
      fetchFilteredProducts();
    } catch (error: any) {
      toast.error(error.message);
      console.error('Error updating product:', error);
    }
  };
  
  
  useEffect(() => {
    fetchFilteredProducts();
  }, [formData.category, formData.subCategory, formData.brand, formData.modal, formData.mop, formData.vendor]);
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [categories, mops, vendors, brands] = await Promise.all([
        fetch('/api/admin/category').then(res => res.json()),
        fetch('/api/admin/mop').then(res => res.json()),
        fetch('/api/admin/vendor').then(res => res.json()),
        fetch('/api/admin/brand').then(res => res.json())
      ]);
      const filteredCategories = categories.filter(
        (cat: any) => cat.type === "consumable"
      );
      setOptions({
        categories: filteredCategories || [],
        subCategories: [],
        brands: brands.brands || [],
        modals: [],
        mops: mops.mops || [],
        vendors: vendors.vendors || []
      });
    } catch (error) {
      toast.error('Failed to fetch initial data');
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredProducts = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const res = await fetch(`/api/admin/stock?${queryParams}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setProducts(data.products || []);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error fetching products:', error);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    try {
        if (name === 'category' && value) {
            // Fetch all subCategories
            const res = await fetch('/api/admin/subCategory');
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error);
            
            // Manually filter subCategories based on categoryId
            const filteredSubCategories = data.subCategories.filter(
              (subCat: any) => subCat.categoryId._id === value
            );
            setOptions(prev => ({ 
              ...prev, 
              subCategories: filteredSubCategories || []
            }));
            setFormData(prev => ({ ...prev, subCategory: '' }));
          }
      else if (name === 'brand' && value) {
        const res = await fetch(`/api/admin/modal?brandId=${value}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        
        setOptions(prev => ({ 
          ...prev, 
          modals: data.modals || [] 
        }));
        setFormData(prev => ({ ...prev, modal: '' }));
      }
    } catch (error) {
      toast.error('Failed to fetch dependent data');
      console.error('Error fetching dependent data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editMode && selectedProduct) {
      await handleUpdate(selectedProduct._id);
    } else {
      try {
        const res = await fetch('/api/admin/stock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to add product');
        }
        toast.success('Product added successfully');
        setFormData({
          category: '',
          subCategory: '',
          brand: '',
          modal: '',
          mop: '',
          vendor: '',
          serialNumber: '',
          productNumber: '',
          billNumber: '',
          billDate: '',
          issued: false
        });
        fetchFilteredProducts();
      } catch (error: any) {
        toast.error(error.message);
        console.error('Error submitting form:', error);
      }
    }
  };
  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }
    return (
    <div className="p-4 text-black bg-white">
      <h1 className="text-2xl font-bold mb-4">Stock Management</h1>
      <label className="inline-flex items-center p-2">
          <input
            type="radio"
            name='type'
            value="consumable"
            onChange={async () => {
              const res = await fetch('/api/admin/category');
              const data = await res.json();
              const filteredCategories = data.filter(
                (cat: any) => cat.type === "consumable"
              );
              setOptions(prev => ({ 
                ...prev, 
                categories: filteredCategories || []
              }));
            }}
            defaultChecked
            className="form-radio h-4 w-4 text-blue-600"
          />
          <span className="ml-2">Consumable</span>
        </label>
        <label className="inline-flex items-center p-2">
          <input
            type="radio"
            name='type'
            value="non-consumable"
            onChange={async () => {
              const res = await fetch('/api/admin/category');
              const data = await res.json();
              const filteredCategories = data.filter(
                (cat: any) => cat.type === "non-consumable"
              );
              setOptions(prev => ({ 
                ...prev, 
                categories: filteredCategories || []
              }));
            }}
            className="form-radio h-4 w-4 text-blue-600"
          />
          <span className="ml-2">Non-Consumable</span>
        </label>
      {/* Product Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Category Select */}
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Category</option>
          {options.categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>

        {/* SubCategory Select */}
        <select
          name="subCategory"
          value={formData.subCategory}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
          disabled={!formData.category}
        >
          <option value="">Select Sub Category</option>
          {options.subCategories.map(subCat => (
            <option key={subCat._id} value={subCat._id}>{subCat.name}</option>
          ))}
        </select>

        {/* Brand Select */}
        <select
          name="brand"
          value={formData.brand}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Brand</option>
          {options.brands.map(brand => (
            <option key={brand._id} value={brand._id}>{brand.name}</option>
          ))}
        </select>

        {/* Modal Select */}
        <select
          name="modal"
          value={formData.modal}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
          disabled={!formData.brand}
        >
          <option value="">Select Modal</option>
          {options.modals.map(modal => (
            <option key={modal._id} value={modal._id}>{modal.name}</option>
          ))}
        </select>

        {/* MOP Select */}
        <select
          name="mop"
          value={formData.mop}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Mode of Purchase</option>
          {options.mops.map(mop => (
            <option key={mop._id} value={mop._id}>{mop.name}</option>
          ))}
        </select>

        {/* Vendor Select */}
        <select
          name="vendor"
          value={formData.vendor}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
        >
          <option value="">Select Vendor</option>
          {options.vendors.map(vendor => (
            <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
          ))}
        </select>

        {/* Other Input Fields */}
        <input
          type="text"
          name="serialNumber"
          value={formData.serialNumber}
          onChange={handleInputChange}
          placeholder="Serial Number"
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          name="productNumber"
          value={formData.productNumber}
          onChange={handleInputChange}
          placeholder="Product Number"
          className="border p-2 rounded"
          required
        />

        <input
          type="text"
          name="billNumber"
          value={formData.billNumber}
          onChange={handleInputChange}
          placeholder="Bill Number"
          className="border p-2 rounded"
          required
        />

        <input
          type="date"
          name="billDate"
          value={formData.billDate}
          onChange={handleInputChange}
          className="border p-2 rounded"
          required
        />

        <div className="flex items-center">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="issued"
              checked={formData.issued}
              onChange={(e) => setFormData(prev => ({ ...prev, issued: e.target.checked }))}
              className="form-checkbox h-4 w-4 text-blue-600 hidden"
            />
          </label>
        </div>

        <div className="flex gap-2">
  <button
    type="submit"
    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
  >
    {editMode ? 'Update Product' : 'Add Product'}
  </button>
  
  {editMode && (
    <button
      type="button"
      onClick={() => {
        setEditMode(false);
        setSelectedProduct(null);
        setFormData({
          category: '',
          subCategory: '',
          brand: '',
          modal: '',
          mop: '',
          vendor: '',
          serialNumber: '',
          productNumber: '',
          billNumber: '',
          billDate: '',
          issued: false
        });
      }}
      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
    >
      Cancel
    </button>
  )}
</div>

      </form>
      <div className="overflow-x-auto shadow-md rounded-lg">
  <table className="min-w-full bg-white">
    <thead>
        <tr>
          <th className="px-4 py-2 border"></th> {/* Category */}
          <th className="px-4 py-2 border"></th> {/* SubCategory */}
          <th className="px-4 py-2 border"></th> {/* Brand */}
          <th className="px-4 py-2 border"></th> {/* Modal */}
          <th className="px-4 py-2 border"></th> {/* MOP */}
          <th className="px-4 py-2 border"></th> {/* Vendor */}
          <th className="px-4 py-2 border">
            <input
              type="text"
              name="serialNumber"
              value={filters.serialNumber}
              onChange={handleFilter}
              placeholder="Filter Serial"
              className="w-full p-1 text-sm border rounded"
            />
          </th>
          <th className="px-4 py-2 border">
            <input
              type="text"
              name="productNumber"
              value={filters.productNumber}
              onChange={handleFilter}
              placeholder="Filter Product"
              className="w-full p-1 text-sm border rounded"
            />
          </th>
          <th className="px-4 py-2 border">
            <input
              type="text"
              name="billNumber"
              value={filters.billNumber}
              onChange={handleFilter}
              placeholder="Filter Bill"
              className="w-full p-1 text-sm border rounded"
            />
          </th>
          <th colSpan={12} className="px-4 py-2 border bg-gray-50">
      <div className="flex gap-4 items-center justify-end">
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium">Date Range:</span>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="border p-1 rounded text-sm"
          />
          <span className="text-sm">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="border p-1 rounded text-sm"
          />
        </div>
      </div>
    </th>
          <th className="px-4 py-2 border"></th> 
          <th className="px-4 py-2 border"></th> 
        </tr>
        {/* Header row */}
        <tr className="bg-gray-100">
          {[
            { key: 'category', label: 'Category' },
            { key: 'subCategory', label: 'Sub Category' },
            { key: 'brand', label: 'Brand' },
            { key: 'modal', label: 'Modal' },
            { key: 'mop', label: 'MOP' },
            { key: 'vendor', label: 'Vendor' },
            { key: 'serialNumber', label: 'Serial Number' },
            { key: 'productNumber', label: 'Product Number' },
            { key: 'billNumber', label: 'Bill Number' },
            { key: 'billDate', label: 'Bill Date' },
            { key: 'issued', label: 'Issued' }
          ].map(({ key, label }) => (
            <th 
              key={key}
              className="px-4 py-2 border cursor-pointer hover:bg-gray-200"
              onClick={() => handleSort(key as keyof Product)}
            >
              <div className="flex items-center justify-between">
                {label}
                {sortConfig.key === key && (
                  <span className="ml-2">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </th>
          ))}
          <th className="px-4 py-2 border">Actions</th>
        </tr>
    </thead>
    <tbody>
    <tr className="bg-gray-50">
    <td colSpan={12} className="px-4 py-2 border">
      <div className="flex justify-between items-center">
        <span>Current Records: {filteredProducts.length}</span>
        <button className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition-colors flex items-center gap-2" onClick={resetFilters}>Reset Filters</button>
        <button
          onClick={generatePDF}
          className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export to PDF
        </button>
      </div>
    </td>
  </tr>

  {paginate(filteredProducts).map((product) => (
        <tr key={product._id} className="hover:bg-gray-50">
          <td className="px-4 py-2 border">{product.category.name}</td>
          <td className="px-4 py-2 border">{product.subCategory.name}</td>
          <td className="px-4 py-2 border">{product.brand.name}</td>
          <td className="px-4 py-2 border">{product.modal.name}</td>
          <td className="px-4 py-2 border">{product.mop.name}</td>
          <td className="px-4 py-2 border">{product.vendor.name}</td>
          <td className="px-4 py-2 border">{product.serialNumber}</td>
          <td className="px-4 py-2 border">{product.productNumber}</td>
          <td className="px-4 py-2 border">{product.billNumber}</td>
          <td className="px-4 py-2 border">
            {format(new Date(product.billDate), 'dd-MM-yy')}
          </td>
          <td className="px-4 py-2 border text-center">
            {product.issued ? 'Yes' : 'No'}
          </td>
          <td className="px-4 py-2 border">
          <div className="flex gap-2 justify-center">
  {product.issued ? (
    // View button for issued products
    <button
      onClick={() => {
        setSelectedProduct(product);
        setShowModal(true);
      }}
      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
    >
      View Details
    </button>
  ) : (
    // Update and Delete buttons for non-issued products
    <>
      <button
        onClick={() => {
          setSelectedProduct(product);
          setEditMode(true);
          setFormData({
            category: product.category._id,
            subCategory: product.subCategory._id,
            brand: product.brand._id,
            modal: product.modal._id,
            mop: product.mop._id,
            vendor: product.vendor._id,
            serialNumber: product.serialNumber,
            productNumber: product.productNumber,
            billNumber: product.billNumber,
            billDate: product.billDate,
            issued: product.issued
          });
        }}
        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
      >
        Update
      </button>
      <button
        onClick={() => {
          if (window.confirm('Are you sure you want to delete this product?')) {
            handleDelete(product._id);
          }
        }}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
      >
        Delete
      </button>
    </>
  )}
</div>

          </td>
        </tr>
      ))}
    </tbody>
  </table>
  <div className="mt-4">
  <PageNumbers />
</div>

</div>


      {showModal && selectedProduct && (
  <ProductDetailsModal 
    product={selectedProduct} 
    onClose={() => {
      setShowModal(false);
      setSelectedProduct(null);
    }}
  />
)}
    </div>
  );
}