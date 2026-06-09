import React, { useState, useEffect } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, MapPin, Tag, Search, DollarSign, Calendar, Mail, Phone, ShoppingBag } from 'lucide-react';
import { API } from '../context/AuthContext';

const AdminReturns = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null); // ID of the currently expanded order row
  const [searchTerm, setSearchTerm] = useState('');
  const [returnStatusTab, setReturnStatusTab] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [adminReturnComments, setAdminReturnComments] = useState({});

  const handleReturnAction = async (id, action) => {
    if (action === 'reject' && !(adminReturnComments[id] || '').trim()) {
      alert('Please provide feedback notes explaining the rejection.');
      return;
    }
    try {
      const comment = adminReturnComments[id] || '';
      const res = await API.put(`/admin/orders/${id}/return`, {
        action,
        adminComment: comment
      });
      
      // Update local state directly
      setOrders(prevOrders => 
        prevOrders.map(order => order.id === id ? { ...order, ...res.data } : order)
      );
      // Clear comment
      setAdminReturnComments(prev => ({ ...prev, [id]: '' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update return request');
    }
  };

  const fetchOrdersData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Fetch orders admin for returns failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, []);

  const toggleExpandRow = (id) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  const getReturnBadgeColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/40';
      case 'Rejected':
        return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40';
      default:
        return 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/40';
    }
  };

  const getPaymentBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/40';
      case 'failed':
        return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40';
      case 'refunded':
        return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40';
      default:
        return 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/40';
    }
  };

  // Filter orders that have return requests, then apply search and tab filter
  const returnRequests = orders.filter(order => !!order.return_status);

  const filteredReturns = returnRequests.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.shipping_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.return_reason?.toLowerCase().includes(searchTerm.toLowerCase());
      
    let matchesTab = false;
    if (returnStatusTab === 'ALL') {
      matchesTab = true;
    } else {
      matchesTab = order.return_status?.toUpperCase() === returnStatusTab;
    }

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-dark dark:text-white uppercase tracking-tight font-heading flex items-center gap-2">
            <RefreshCw className="text-brand-accent" size={24} /> Returns & Refunds Manager
          </h1>
          <p className="text-xs font-semibold text-brand-grey dark:text-gray-400 uppercase tracking-wider font-heading mt-0.5">
            Process formulation return requests, review diagnostic feedback, and execute refunds
          </p>
        </div>
        <button 
          onClick={fetchOrdersData} 
          className="p-2 border border-brand-border dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 hover:bg-brand-bg-grey dark:hover:bg-zinc-800 text-brand-dark dark:text-gray-250 transition-colors shadow-xs"
          title="Refresh Returns list"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Tabs & Search Control Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-xs">
        {/* Search */}
        <div className="relative w-full lg:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-grey dark:text-zinc-500">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search by Order ID, customer, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-brand-border dark:border-zinc-800 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-blue/50 bg-white dark:bg-zinc-900 text-brand-dark dark:text-white"
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-brand-bg-grey dark:bg-zinc-950 p-1 rounded-lg border border-brand-border/60 dark:border-zinc-850/60 overflow-x-auto w-full lg:w-auto">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => {
            const isActive = returnStatusTab === tab;
            // Count matching returns
            const count = returnRequests.filter(r => tab === 'ALL' ? true : r.return_status?.toUpperCase() === tab).length;
            
            return (
              <button
                key={tab}
                onClick={() => setReturnStatusTab(tab)}
                className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white dark:bg-zinc-850 text-brand-blue dark:text-white shadow-xs'
                    : 'text-brand-grey dark:text-zinc-400 hover:text-brand-dark dark:hover:text-zinc-200'
                }`}
              >
                {tab} Requests
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  isActive 
                    ? 'bg-brand-blue/10 dark:bg-zinc-800 text-brand-blue dark:text-white' 
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-450'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden transition-colors duration-300">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="animate-spin text-brand-blue" size={32} />
            <p className="text-xs font-semibold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">
              Querying database returns...
            </p>
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="text-center py-20 text-xs text-brand-grey dark:text-zinc-400 font-medium">
            No return requests matching the active filter found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-dark dark:text-gray-250">
              <thead>
                <tr className="border-b border-brand-border dark:border-zinc-800 bg-brand-bg-grey dark:bg-zinc-800/40 text-brand-grey dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 w-12">Details</th>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Date Requested</th>
                  <th className="py-4 px-6">Return Reason</th>
                  <th className="py-4 px-6 text-right">Refund Amount</th>
                  <th className="py-4 px-6">Refund Status</th>
                  <th className="py-4 px-6">Return Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 dark:divide-zinc-800/60 font-medium">
                {filteredReturns.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <React.Fragment key={order.id}>
                      {/* Standard Return Row */}
                      <tr className="hover:bg-brand-bg-grey/30 dark:hover:bg-zinc-850 transition-colors">
                        <td className="py-4 px-6">
                          <button
                            onClick={() => toggleExpandRow(order.id)}
                            className="p-1 rounded hover:bg-brand-blue-light dark:hover:bg-zinc-800 text-brand-blue dark:text-zinc-300 transition-colors"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </td>
                        <td className="py-4 px-6 font-bold text-brand-blue">
                          #ORD-{order.id}
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-bold text-brand-dark dark:text-white">{order.shipping_name}</div>
                            <div className="text-[10px] text-brand-grey dark:text-zinc-400 font-semibold">{order.shipping_email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-brand-grey dark:text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {new Date(order.return_date || order.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-bold text-brand-dark dark:text-white">
                          {order.return_reason}
                        </td>
                        <td className="py-4 px-6 text-right font-black text-brand-dark dark:text-white">
                          ₹{parseFloat(order.net_price).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold border ${getPaymentBadgeColor(order.payment_status)}`}>
                            {order.payment_status === 'Refunded' ? 'Refunded' : 'Pending Refund'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold border ${getReturnBadgeColor(order.return_status)}`}>
                            {order.return_status}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-brand-bg-grey/40 dark:bg-zinc-950/20">
                          <td colSpan="8" className="p-6 border-l-2 border-brand-blue space-y-6">
                            
                            {/* Return Action / Feedback Block */}
                            <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-lg p-5 space-y-4 shadow-sm animate-fade-up text-left">
                              <h4 className="font-black text-brand-blue-dark dark:text-brand-blue text-[10px] uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border dark:border-zinc-800 pb-2">
                                <RefreshCw size={13} className="text-brand-accent" /> Process Return Request Details
                              </h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-brand-dark dark:text-gray-350 font-medium">
                                <div className="space-y-2.5">
                                  <div className="space-y-1 bg-brand-bg-grey dark:bg-zinc-850 p-3 rounded border border-brand-border/60">
                                    <span className="font-extrabold uppercase text-[9px] block text-brand-blue">Customer Reason & Explanation:</span>
                                    <div className="font-bold text-brand-dark dark:text-white text-xs mt-1">
                                      {order.return_reason}
                                    </div>
                                    <p className="text-brand-grey dark:text-gray-250 text-xs italic mt-1.5 leading-relaxed">
                                      "{order.return_comment || 'No explanation provided.'}"
                                    </p>
                                  </div>
                                  
                                  <div className="flex justify-between border-b border-brand-border/40 pb-1.5">
                                    <span className="text-brand-grey dark:text-zinc-400">Request Date:</span>
                                    <span className="font-bold">{new Date(order.return_date).toLocaleString()}</span>
                                  </div>

                                  <div className="flex justify-between border-b border-brand-border/40 pb-1.5">
                                    <span className="text-brand-grey dark:text-zinc-400">Invoice Net Price:</span>
                                    <span className="font-bold">₹{parseFloat(order.net_price).toLocaleString()}</span>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  {order.return_status === 'Pending' ? (
                                    <div className="space-y-3">
                                      <span className="text-brand-grey dark:text-zinc-405 block uppercase font-bold text-[10px]">Verify & Authorize Return</span>
                                      <div>
                                        <label className="block text-[9px] font-bold text-brand-grey uppercase mb-1">Dermatology Feedback Notes / Admin Comments *</label>
                                        <textarea
                                          rows="3"
                                          value={adminReturnComments[order.id] || ''}
                                          onChange={(e) => setAdminReturnComments(prev => ({ ...prev, [order.id]: e.target.value }))}
                                          className="w-full px-3 py-2 border border-brand-border dark:border-zinc-800 rounded bg-white dark:bg-zinc-850 text-brand-dark dark:text-gray-155 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
                                          placeholder="Provide feedback details or reasons explaining approval or rejection..."
                                        ></textarea>
                                      </div>
                                      <div className="flex gap-3 pt-1">
                                        <button
                                          onClick={() => handleReturnAction(order.id, 'approve')}
                                          className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold uppercase tracking-wider text-[10px] cursor-pointer"
                                        >
                                          Approve & Refund
                                        </button>
                                        <button
                                          onClick={() => handleReturnAction(order.id, 'reject')}
                                          className="flex-1 py-2 bg-brand-accent hover:bg-red-750 text-white rounded font-bold uppercase tracking-wider text-[10px] cursor-pointer"
                                        >
                                          Reject Request
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-brand-bg-grey dark:bg-zinc-850 p-4 rounded border border-brand-border space-y-2">
                                      <span className="font-extrabold uppercase text-[9px] block text-brand-blue">Dermatology Feedback Notes</span>
                                      <p className="font-bold text-brand-dark dark:text-white leading-relaxed">
                                        {order.return_admin_comment || 'No feedback comments provided.'}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Address & Item breakdown details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-brand-dark dark:text-gray-300 pt-2">
                              {/* Shipping address details */}
                              <div className="space-y-3 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-brand-border dark:border-zinc-800 shadow-2xs">
                                <h4 className="font-black text-brand-blue-dark dark:text-brand-blue text-[10px] uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border dark:border-zinc-800 pb-2">
                                  <MapPin size={13} /> Return Shipping Origin
                                </h4>
                                <div className="space-y-1 text-brand-dark dark:text-gray-200">
                                  <div className="font-bold">{order.shipping_name}</div>
                                  <div>{order.shipping_address}</div>
                                  <div>{order.shipping_city}, {order.shipping_state} - {order.shipping_zip}</div>
                                </div>
                                <div className="space-y-1.5 pt-2 border-t border-brand-border dark:border-zinc-800 text-brand-grey dark:text-zinc-400">
                                  <div className="flex items-center gap-1.5">
                                    <Mail size={12} /> {order.shipping_email}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Phone size={12} /> {order.shipping_phone}
                                  </div>
                                </div>
                              </div>

                              {/* Net Breakdown */}
                              <div className="space-y-3 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-brand-border dark:border-zinc-800 shadow-2xs">
                                <h4 className="font-black text-brand-blue-dark dark:text-brand-blue text-[10px] uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border dark:border-zinc-800 pb-2">
                                  <DollarSign size={13} /> Pricing Breakdown
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-brand-grey dark:text-zinc-400">Subtotal:</span>
                                    <span className="font-bold">₹{parseFloat(order.total_price).toLocaleString()}</span>
                                  </div>
                                  {parseFloat(order.discount_amount) > 0 && (
                                    <div className="flex justify-between text-brand-accent">
                                      <span>Discount Code:</span>
                                      <span className="font-bold">-₹{parseFloat(order.discount_amount).toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-brand-grey dark:text-zinc-400">Cleared Via:</span>
                                    <span className="font-bold uppercase text-[10px] tracking-wider">{order.payment_method}</span>
                                  </div>
                                  <div className="border-t border-brand-border dark:border-zinc-800 pt-2 flex justify-between font-black text-sm text-brand-dark dark:text-white">
                                    <span>Net Paid Value:</span>
                                    <span>₹{parseFloat(order.net_price).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Returning formulation list */}
                              <div className="space-y-3 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-brand-border dark:border-zinc-800 shadow-2xs">
                                <h4 className="font-black text-brand-blue-dark dark:text-brand-blue text-[10px] uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border dark:border-zinc-800 pb-2">
                                  <ShoppingBag size={13} /> Formulations Catalog ({order.items?.length || 0})
                                </h4>
                                <div className="divide-y divide-brand-border/60 dark:divide-zinc-800/60 max-h-48 overflow-y-auto pr-1">
                                  {(order.items || []).map((item, index) => (
                                    <div key={item.id || index} className="py-2 flex justify-between gap-4 items-center">
                                      <div className="space-y-0.5">
                                        <div className="font-bold text-brand-dark dark:text-white line-clamp-1">
                                          {item.product_name}
                                        </div>
                                        <div className="text-[10px] text-brand-grey dark:text-zinc-400">
                                          ₹{parseFloat(item.price).toLocaleString()} x {item.quantity}
                                        </div>
                                      </div>
                                      <span className="font-black text-brand-dark dark:text-white">
                                        ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReturns;
