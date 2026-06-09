import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  RefreshCw, 
  AlertCircle, 
  Calendar,
  DollarSign,
  Percent,
  Search
} from 'lucide-react';
import { API } from '../context/AuthContext';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Coupon Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null); // null means Creating new, otherwise holding existing coupon data

  // Form Fields
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage', 'fixed'
  const [discountValue, setDiscountValue] = useState('');
  const [minCartValue, setMinCartValue] = useState('0');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch all coupons
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = () => {
    setLoading(true);
    setErrorMsg('');
    API.get('/coupons/admin')
      .then(res => {
        setCoupons(res.data);
      })
      .catch(err => {
        console.error('Fetch admin coupons failed:', err.message);
        setErrorMsg('Failed to load coupons. Please check database connectivity.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleOpenCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue('');
    setMinCartValue('0');
    setMaxDiscountAmount('');
    setDescription('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discount_type);
    setDiscountValue(coupon.discount_value.toString());
    setMinCartValue((coupon.min_cart_value || 0).toString());
    setMaxDiscountAmount(coupon.max_discount_amount ? coupon.max_discount_amount.toString() : '');
    setDescription(coupon.description || '');
    setIsActive(coupon.is_active !== false);
    setIsModalOpen(true);
  };

  const handleDeleteCoupon = (couponCode) => {
    if (!window.confirm(`Are you sure you want to delete coupon code '${couponCode}'?`)) {
      return;
    }

    API.delete(`/coupons/admin/${couponCode}`)
      .then(() => {
        setSuccessMsg(`Coupon '${couponCode}' deleted successfully.`);
        fetchCoupons();
        setTimeout(() => setSuccessMsg(''), 3000);
      })
      .catch(err => {
        console.error('Delete coupon failed:', err.message);
        setErrorMsg(err.response?.data?.message || 'Failed to delete coupon.');
        setTimeout(() => setErrorMsg(''), 4000);
      });
  };

  const handleToggleStatus = (coupon) => {
    const updatedStatus = coupon.is_active === false;
    API.put(`/coupons/admin/${coupon.code}`, {
      ...coupon,
      is_active: updatedStatus
    })
      .then(() => {
        setSuccessMsg(`Coupon '${coupon.code}' status toggled.`);
        fetchCoupons();
        setTimeout(() => setSuccessMsg(''), 3000);
      })
      .catch(err => {
        console.error('Toggle coupon status failed:', err.message);
        setErrorMsg(err.response?.data?.message || 'Failed to update status.');
        setTimeout(() => setErrorMsg(''), 4000);
      });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!code || !discountValue) {
      setErrorMsg('Please enter a valid coupon code and discount value.');
      return;
    }

    setFormSubmitting(true);
    setErrorMsg('');

    const payload = {
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      min_cart_value: parseFloat(minCartValue || 0),
      max_discount_amount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      description,
      is_active: isActive
    };

    try {
      if (editingCoupon) {
        // Update existing coupon
        await API.put(`/coupons/admin/${editingCoupon.code}`, payload);
        setSuccessMsg(`Coupon '${payload.code}' updated successfully.`);
      } else {
        // Create new coupon
        await API.post('/coupons/admin', payload);
        setSuccessMsg(`Coupon '${payload.code}' created successfully.`);
      }
      setIsModalOpen(false);
      fetchCoupons();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Save coupon error:', err.message);
      setErrorMsg(err.response?.data?.message || 'Failed to save coupon details.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filter logic
  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-dark dark:text-white uppercase tracking-tight font-heading">
            Coupon & Discount Campaigns
          </h1>
          <p className="text-[10px] sm:text-xs font-semibold text-brand-grey dark:text-gray-400 uppercase tracking-wider font-heading mt-0.5">
            Manage checkout promotion code rules and active client discounts
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded font-bold font-heading text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={15} /> Create Coupon
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-400 text-xs font-semibold rounded-lg">
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-brand-accent dark:text-red-400 text-xs font-semibold rounded-lg flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-brand-border dark:border-zinc-800 rounded text-xs bg-white dark:bg-zinc-850 text-brand-dark dark:text-gray-150 focus:outline-none focus:border-brand-blue"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grey dark:text-gray-450" size={14} />
        </div>

        <button
          onClick={fetchCoupons}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-brand-border dark:border-zinc-800 hover:bg-brand-bg-grey dark:hover:bg-zinc-800 rounded text-xs font-bold text-brand-dark dark:text-gray-200 transition-colors cursor-pointer"
        >
          <RefreshCw size={13} /> Refresh List
        </button>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="animate-spin text-brand-blue" size={32} />
          <p className="text-xs text-brand-grey dark:text-gray-400 font-heading uppercase tracking-wider">Loading coupons database...</p>
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl space-y-4">
          <Tag className="text-brand-grey dark:text-gray-500 mx-auto stroke-[1.5]" size={40} />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-brand-dark dark:text-white font-heading uppercase">No Coupons Available</h3>
            <p className="text-xs text-brand-grey dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
              No promotional campaigns match your search terms. Create one to release active codes.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-brand-dark dark:text-gray-200">
              <thead>
                <tr className="bg-brand-bg-grey dark:bg-zinc-850 border-b border-brand-border dark:border-zinc-800 text-[10px] text-brand-grey dark:text-gray-400 font-extrabold uppercase tracking-wider">
                  <th className="px-6 py-4">Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Min Spend</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 dark:divide-zinc-800/60">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.code} className="hover:bg-brand-bg-grey/30 dark:hover:bg-zinc-850/20 transition-colors">
                    <td className="px-6 py-4 font-black font-heading uppercase text-brand-blue dark:text-brand-blue-light">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        coupon.discount_type === 'percentage' 
                          ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30'
                          : 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30'
                      }`}>
                        {coupon.discount_type === 'percentage' ? <Percent size={10} /> : <DollarSign size={10} />}
                        {coupon.discount_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                    </td>
                    <td className="px-6 py-4 text-brand-grey dark:text-gray-400">
                      ₹{coupon.min_cart_value || '0'}
                    </td>
                    <td className="px-6 py-4 text-brand-grey dark:text-gray-400 max-w-xs truncate" title={coupon.description}>
                      {coupon.description || '--'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        className={`px-2.5 py-1 text-[9px] uppercase font-extrabold rounded-full border transition-all cursor-pointer ${
                          coupon.is_active !== false
                            ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/40 hover:bg-green-100'
                            : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40 hover:bg-red-100'
                        }`}
                      >
                        {coupon.is_active !== false ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEditModal(coupon)}
                        className="text-brand-blue hover:text-brand-blue-dark p-1 border border-transparent hover:border-brand-border dark:hover:border-zinc-800 rounded transition-all cursor-pointer inline-flex"
                        title="Edit Coupon"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.code)}
                        className="text-brand-accent hover:text-red-600 p-1 border border-transparent hover:border-brand-border dark:hover:border-zinc-800 rounded transition-all cursor-pointer inline-flex"
                        title="Delete Coupon"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Edit/Create Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-up">
            
            {/* Modal Header */}
            <div className="bg-brand-blue-dark text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-heading flex items-center gap-2">
                <Tag size={16} /> {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create Promotion Code'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-300 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Code (uppercase) */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-brand-grey dark:text-gray-400 uppercase tracking-wider mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCoupon} // Cannot change code after creation to preserve unique database index integrity
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-brand-border dark:border-zinc-800 rounded text-xs bg-white dark:bg-zinc-850 disabled:bg-brand-bg-grey dark:disabled:bg-zinc-950 text-brand-dark dark:text-gray-150 focus:outline-none focus:border-brand-blue"
                    placeholder="e.g. DERMA25"
                  />
                </div>

                {/* Discount Type */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-grey dark:text-gray-400 uppercase tracking-wider mb-1">Discount Type *</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-border dark:border-zinc-800 rounded text-xs bg-white dark:bg-zinc-850 font-semibold focus:outline-none focus:border-brand-blue"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Flat (₹)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-grey dark:text-gray-400 uppercase tracking-wider mb-1">
                    Value * ({discountType === 'percentage' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-border dark:border-zinc-800 rounded text-xs bg-white dark:bg-zinc-850 text-brand-dark dark:text-gray-150 focus:outline-none focus:border-brand-blue"
                    placeholder={discountType === 'percentage' ? '25' : '124'}
                  />
                </div>

                {/* Min Cart Spend */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-grey dark:text-gray-400 uppercase tracking-wider mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={minCartValue}
                    onChange={(e) => setMinCartValue(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-border dark:border-zinc-800 rounded text-xs bg-white dark:bg-zinc-850 text-brand-dark dark:text-gray-150 focus:outline-none focus:border-brand-blue"
                    placeholder="e.g. 400"
                  />
                </div>

                {/* Max Discount Amount */}
                <div>
                  <label className="block text-[10px] font-bold text-brand-grey dark:text-gray-400 uppercase tracking-wider mb-1">Max Cap (For % type, ₹)</label>
                  <input
                    type="number"
                    min="0"
                    disabled={discountType !== 'percentage'}
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-border dark:border-zinc-800 rounded text-xs bg-white dark:bg-zinc-850 disabled:bg-brand-bg-grey dark:disabled:bg-zinc-950 text-brand-dark dark:text-gray-150 focus:outline-none focus:border-brand-blue"
                    placeholder="e.g. 250"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-brand-grey dark:text-gray-400 uppercase tracking-wider mb-1">Display Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-border dark:border-zinc-800 rounded text-xs bg-white dark:bg-zinc-850 text-brand-dark dark:text-gray-150 focus:outline-none focus:border-brand-blue"
                    placeholder="e.g. Save 25% off on your formulations."
                  />
                </div>

                {/* Status Toggle */}
                <div className="sm:col-span-2 flex items-center justify-between border-t border-brand-border dark:border-zinc-800 pt-4 mt-2">
                  <div>
                    <span className="block text-xs font-bold text-brand-dark dark:text-white uppercase tracking-wider">Release Status</span>
                    <span className="block text-[10px] text-brand-grey dark:text-gray-400">Control if users can apply this code immediately</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isActive}
                      onChange={() => setIsActive(!isActive)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-850 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-blue"></div>
                  </label>
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-brand-border dark:border-zinc-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-brand-border dark:border-zinc-800 text-brand-dark dark:text-gray-300 hover:bg-brand-bg-grey dark:hover:bg-zinc-800 rounded font-bold font-heading text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded font-bold font-heading text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? 'Saving...' : 'Save Campaign'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCoupons;
