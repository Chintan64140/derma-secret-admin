import React, { useState, useEffect } from 'react';
import { Truck, Save, RefreshCw, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { API } from '../context/AuthContext';

const AdminShipping = () => {
  const [shippingFee, setShippingFee] = useState('50');
  const [threshold, setThreshold] = useState('449');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch shipping settings from backend
  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/products/cms/shipping');
      if (res.data) {
        setShippingFee(res.data.shipping_fee.toString());
        setThreshold(res.data.free_shipping_threshold.toString());
      }
    } catch (err) {
      console.error('Fetch shipping settings failed:', err.message);
      setError('Failed to fetch shipping settings from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save updated settings to backend
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const feeVal = parseFloat(shippingFee);
    const thresholdVal = parseFloat(threshold);

    if (isNaN(feeVal) || feeVal < 0) {
      setError('Standard Shipping Fee must be a valid positive number.');
      setSaving(false);
      return;
    }

    if (isNaN(thresholdVal) || thresholdVal < 0) {
      setError('Free Shipping Threshold must be a valid positive number.');
      setSaving(false);
      return;
    }

    try {
      const res = await API.put('/admin/cms/shipping', {
        shipping_fee: feeVal,
        free_shipping_threshold: thresholdVal
      });
      if (res.data) {
        setShippingFee(res.data.shipping_fee?.toString() || feeVal.toString());
        setThreshold(res.data.free_shipping_threshold?.toString() || thresholdVal.toString());
      }
      setSuccess('Shipping configurations saved successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Save shipping settings failed:', err.message);
      setError(err.response?.data?.message || 'Failed to update shipping settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-dark dark:text-white uppercase tracking-tight font-heading">
            Shipping & Dispatch Settings
          </h1>
          <p className="text-xs font-semibold text-brand-grey dark:text-gray-400 uppercase tracking-wider font-heading mt-0.5">
            Configure standard delivery fees and cart thresholds for the online storefront
          </p>
        </div>
        <button 
          onClick={fetchSettings} 
          disabled={loading || saving}
          className="p-2 border border-brand-border dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 hover:bg-brand-bg-grey dark:hover:bg-zinc-855 text-brand-dark dark:text-gray-250 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh Settings"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Success / Error Alerts */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold rounded-lg flex items-center gap-2 animate-fade-in uppercase">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-905 text-brand-accent dark:text-red-400 text-xs font-bold rounded-lg flex items-center gap-2 animate-fade-in uppercase">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Configuration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-brand-border dark:border-zinc-800 bg-brand-bg-grey/30 dark:bg-zinc-800/20">
            <h3 className="text-xs font-bold text-brand-dark dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Truck size={16} className="text-brand-blue" /> Storefront Shipping Formula
            </h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <RefreshCw className="animate-spin text-brand-blue" size={32} />
              <p className="text-xs font-semibold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">
                Loading database configurations...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Shipping Fee Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-brand-grey dark:text-zinc-400 font-bold uppercase tracking-wider">
                    Standard Shipping Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={shippingFee}
                    onChange={(e) => setShippingFee(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-brand-border dark:border-zinc-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-blue/50 bg-white dark:bg-zinc-850 text-brand-dark dark:text-white"
                    placeholder="e.g. 50"
                  />
                  <span className="block text-[9px] text-brand-grey dark:text-gray-500 font-semibold leading-relaxed">
                    Charge applied to shipments failing to cross the free shipping threshold.
                  </span>
                </div>

                {/* Free Shipping Threshold Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-brand-grey dark:text-zinc-400 font-bold uppercase tracking-wider">
                    Free Shipping Threshold (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-brand-border dark:border-zinc-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-blue/50 bg-white dark:bg-zinc-850 text-brand-dark dark:text-white"
                    placeholder="e.g. 449"
                  />
                  <span className="block text-[9px] text-brand-grey dark:text-gray-500 font-semibold leading-relaxed">
                    Minimum gross order value (after coupons) required to qualify for free delivery.
                  </span>
                </div>
              </div>

              {/* Form Action Controls */}
              <div className="pt-4 border-t border-brand-border dark:border-zinc-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-lg font-bold font-heading text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save Configurations'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          <div className="bg-brand-blue-light/20 dark:bg-brand-blue/5 border border-brand-blue/20 dark:border-brand-blue/30 rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-brand-blue-dark dark:text-brand-blue uppercase tracking-wider flex items-center gap-1.5 font-heading">
              <HelpCircle size={15} /> Formula Details
            </h4>
            <div className="text-[10px] leading-relaxed text-brand-blue-dark dark:text-brand-blue-light font-medium space-y-3">
              <p>
                The storefront dynamically computes shipping charges during cart checkouts based on these rules:
              </p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li>If the cart Net Total is **greater than or equal to** the configured threshold, shipping is **FREE**.</li>
                <li>Otherwise, the **Standard Shipping Fee** is appended to the order receipt and charged.</li>
              </ul>
              <p className="border-t border-brand-blue/15 pt-3 font-semibold text-gray-505 dark:text-gray-400">
                Any changes made here are applied instantly to active checkouts, database order inserts, and Razorpay payment links.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminShipping;
