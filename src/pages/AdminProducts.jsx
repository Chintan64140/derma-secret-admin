import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { API } from '../context/AuthContext';
import { getImageUrl } from '../utils/image';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load products list
  const fetchProductsData = async () => {
    setLoading(true);
    try {
      const prodRes = await API.get('/admin/products');
      setProducts(prodRes.data);
    } catch (err) {
      console.error('Fetch products admin failed:', err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductsData();
  }, []);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/admin/products/${id}`);
      fetchProductsData(); // Reload list
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-dark dark:text-white uppercase tracking-tight font-heading">
            Products Catalog CRUD
          </h1>
          <p className="text-xs font-semibold text-brand-grey dark:text-zinc-400 uppercase tracking-wider font-heading mt-0.5">
            Add, update, or remove clinical skincare products from database
          </p>
        </div>

        <Link
          to="create"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded font-bold font-heading text-xs uppercase tracking-wider transition-all shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} /> Add Formulation
        </Link>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="animate-spin text-brand-blue" size={32} />
          <p className="text-xs font-semibold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">
            Loading catalog database...
          </p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center p-12 bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl">
          <p className="text-xs text-brand-grey dark:text-zinc-400 font-medium">No products found in the database. Click Add Formulation to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-dark dark:text-zinc-200">
              <thead>
                <tr className="border-b border-brand-border dark:border-zinc-800 bg-brand-bg-grey dark:bg-zinc-850 text-brand-grey dark:text-zinc-450 font-bold uppercase tracking-wider">
                  <th className="py-4 px-4 w-16">Image</th>
                  <th className="py-4 px-4">SKU / Code</th>
                  <th className="py-4 px-4">Formulation Name</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Weight/Size</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Badges</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 dark:divide-zinc-800/60 font-medium">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-brand-bg-grey/30 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 bg-brand-bg-grey dark:bg-zinc-800 border border-brand-border dark:border-zinc-700 rounded overflow-hidden flex items-center justify-center">
                        <img 
                          src={getImageUrl(prod.image_url)} 
                          alt="" 
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => { e.target.src = '/assets/products/placeholder.png'; }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-500 dark:text-zinc-400">{prod.sku || 'N/A'}</td>
                    <td className="py-3 px-4 font-bold max-w-[200px] truncate text-brand-dark dark:text-white" title={prod.name}>{prod.name}</td>
                    <td className="py-3 px-4 text-brand-grey dark:text-zinc-450 font-bold">
                      <div className="flex flex-wrap gap-1">
                        {prod.all_categories && prod.all_categories.length > 0 ? (
                          prod.all_categories.map((cat, idx) => (
                            <span key={cat.id || idx} className="bg-brand-blue-light text-brand-blue px-1.5 py-0.5 rounded text-[10px] dark:bg-zinc-800 dark:text-brand-blue-light">
                              {cat.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 dark:text-zinc-650">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-brand-grey dark:text-zinc-400">{prod.weight || '-'}</td>
                    <td className="py-3 px-4 font-bold text-brand-dark dark:text-white">
                      <div className="flex flex-col">
                        <span>₹{parseFloat(prod.price)}</span>
                        {prod.compare_price && (
                          <span className="text-[10px] text-brand-grey dark:text-zinc-500 line-through">₹{parseFloat(prod.compare_price)}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {prod.is_best_seller && (
                          <span className="bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-450 border border-yellow-200 dark:border-yellow-900/40 text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold">Best</span>
                        )}
                        {prod.is_new_arrival && (
                          <span className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40 text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold">New</span>
                        )}
                        {!prod.is_best_seller && !prod.is_new_arrival && <span className="text-gray-400 dark:text-zinc-650 text-[9px]">-</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`edit/${prod.id}`}
                          className="p-1.5 text-brand-blue dark:text-blue-400 hover:bg-brand-blue-light dark:hover:bg-brand-blue/15 rounded transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 size={15} />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 text-brand-accent dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
