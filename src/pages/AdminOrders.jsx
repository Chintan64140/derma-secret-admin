import React, { useState, useEffect } from 'react';
import { ClipboardList, RefreshCw, ChevronDown, ChevronUp, MapPin, Tag, Search, DollarSign, Calendar, Mail, Phone, ShoppingBag } from 'lucide-react';
import { API } from '../context/AuthContext';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null); // ID of the currently expanded order row
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
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
      console.error('Fetch orders admin failed:', err.message);
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

  const handleStatusChange = async (id, field, value) => {
    try {
      const payload = {};
      if (field === 'shipping') payload.shipping_status = value;
      if (field === 'payment') payload.payment_status = value;

      const res = await API.put(`/admin/orders/${id}`, payload);
      
      // Update local state directly
      setOrders(prevOrders => 
        prevOrders.map(order => order.id === id ? { ...order, ...res.data } : order)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const getShippingBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/40';
      case 'shipped':
        return 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40';
      case 'ready to ship':
        return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/40';
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40';
      case 'return requested':
        return 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/40';
      case 'returned':
        return 'bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-900/40';
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

  // Filter orders by search term and dropdown status filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.shipping_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_email?.toLowerCase().includes(searchTerm.toLowerCase());
      
    let matchesStatus = false;
    if (statusFilter === 'ALL') {
      matchesStatus = true;
    } else if (statusFilter === 'RETURNS') {
      matchesStatus = !!order.return_status;
    } else {
      matchesStatus = order.shipping_status?.toUpperCase() === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-dark dark:text-white uppercase tracking-tight font-heading">
            Order Management
          </h1>
          <p className="text-xs font-semibold text-brand-grey dark:text-gray-400 uppercase tracking-wider font-heading mt-0.5">
            Monitor, inspect, and update fulfillment tracking and customer transaction receipts
          </p>
        </div>
        <button 
          onClick={fetchOrdersData} 
          className="p-2 border border-brand-border dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 hover:bg-brand-bg-grey dark:hover:bg-zinc-800 text-brand-dark dark:text-gray-250 transition-colors shadow-xs"
          title="Refresh Orders list"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-grey dark:text-zinc-500">
            <Search size={15} />
          </span>
          <input
            type="text"
            placeholder="Search by Order ID, customer name, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-brand-border dark:border-zinc-800 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-blue/50 bg-white dark:bg-zinc-900 text-brand-dark dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider hidden sm:inline">
            Status Filter:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-brand-border dark:border-zinc-800 rounded text-xs font-bold uppercase bg-white dark:bg-zinc-900 text-brand-dark dark:text-white focus:outline-none"
          >
            <option value="ALL">All Shipping Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="READY TO SHIP">Ready to Ship</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RETURNS">Return Requests</option>
          </select>
        </div>
      </div>

      {/* Orders Directory Table */}
      <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden transition-colors duration-300">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="animate-spin text-brand-blue" size={32} />
            <p className="text-xs font-semibold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">
              Querying database transactions...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-xs text-brand-grey dark:text-zinc-400 font-medium">
            No customer orders matching the current filter filters found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-dark dark:text-gray-250">
              <thead>
                <tr className="border-b border-brand-border dark:border-zinc-800 bg-brand-bg-grey dark:bg-zinc-800/40 text-brand-grey dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6 w-12">Details</th>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Purchase Date</th>
                  <th className="py-4 px-6 text-right">Net Price</th>
                  <th className="py-4 px-6">Shipping Tracking</th>
                  <th className="py-4 px-6">Payment Status</th>
                  <th className="py-4 px-6">Return Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 dark:divide-zinc-800/60 font-medium">
                {filteredOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  return (
                    <React.Fragment key={order.id}>
                      {/* Standard Order Row */}
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
                            {new Date(order.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right font-black text-brand-dark dark:text-white">
                          ₹{parseFloat(order.net_price).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <select
                              value={order.shipping_status}
                              onChange={(e) => handleStatusChange(order.id, 'shipping', e.target.value)}
                              className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold border focus:outline-none ${getShippingBadgeColor(order.shipping_status)}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Ready to Ship">Ready to Ship</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="Return Requested">Return Requested</option>
                              <option value="Returned">Returned</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={order.payment_status}
                            onChange={(e) => handleStatusChange(order.id, 'payment', e.target.value)}
                            className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold border focus:outline-none ${getPaymentBadgeColor(order.payment_status)}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Failed">Failed</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                        </td>
                        <td className="py-4 px-6">
                          {order.return_status ? (
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold border ${
                              order.return_status === 'Approved'
                                ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/40'
                                : order.return_status === 'Rejected'
                                  ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-905/40'
                                  : 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-905/40'
                            }`}>{order.return_status}</span>
                          ) : (
                            <span className="text-[10px] font-bold text-brand-grey dark:text-zinc-500 uppercase">
                              N/A
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-brand-bg-grey/40 dark:bg-zinc-950/20">
                          <td colSpan="8" className="p-6 border-l-2 border-brand-blue space-y-6">
                            
                            {/* Return Request Details Card (if applicable) */}
                            {order.return_status && (
                              <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-lg p-5 space-y-4 shadow-sm animate-fade-up text-left">
                                <h4 className="font-black text-brand-blue-dark dark:text-brand-blue text-[10px] uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border dark:border-zinc-800 pb-2">
                                  <RefreshCw size={13} className="text-brand-accent animate-pulse" /> Customer Return Request Details
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-brand-dark dark:text-gray-350 font-medium">
                                  <div className="space-y-2">
                                    <div className="flex justify-between border-b border-brand-border/40 pb-1.5">
                                      <span className="text-brand-grey dark:text-zinc-400">Return Status:</span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-extrabold border ${
                                        order.return_status === 'Approved'
                                          ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200'
                                          : order.return_status === 'Rejected'
                                            ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200'
                                            : 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200'
                                      }`}>{order.return_status}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-brand-border/40 pb-1.5">
                                      <span className="text-brand-grey dark:text-zinc-400">Request Reason:</span>
                                      <span className="font-bold text-brand-dark dark:text-white">{order.return_reason}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-brand-border/40 pb-1.5">
                                      <span className="text-brand-grey dark:text-zinc-400">Requested Date:</span>
                                      <span>{new Date(order.return_date).toLocaleString()}</span>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-brand-grey dark:text-zinc-400 block">Customer Explanation:</span>
                                      <p className="bg-brand-bg-grey dark:bg-zinc-850 p-2.5 rounded border border-brand-border/60 text-brand-dark dark:text-gray-250 text-xs italic">
                                        "{order.return_comment || 'No explanation provided.'}"
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    {order.return_status === 'Pending' ? (
                                      <div className="space-y-3">
                                        <span className="text-brand-grey dark:text-zinc-405 block uppercase font-bold text-[10px]">Process Return Request</span>
                                        <div>
                                          <label className="block text-[9px] font-bold text-brand-grey uppercase mb-1">Feedback Notes / Comment</label>
                                          <textarea
                                            rows="3"
                                            value={adminReturnComments[order.id] || ''}
                                            onChange={(e) => setAdminReturnComments(prev => ({ ...prev, [order.id]: e.target.value }))}
                                            className="w-full px-3 py-2 border border-brand-border dark:border-zinc-800 rounded bg-white dark:bg-zinc-850 text-brand-dark dark:text-gray-150 text-xs focus:outline-none focus:border-brand-blue"
                                            placeholder="Provide notes, refund verification details or reason for rejection..."
                                          ></textarea>
                                        </div>
                                        <div className="flex gap-3 pt-1">
                                          <button
                                            onClick={() => handleReturnAction(order.id, 'approve')}
                                            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-bold uppercase tracking-wider text-[10px]"
                                          >
                                            Approve & Refund
                                          </button>
                                          <button
                                            onClick={() => handleReturnAction(order.id, 'reject')}
                                            className="flex-1 py-2 bg-brand-accent hover:bg-red-750 text-white rounded font-bold uppercase tracking-wider text-[10px]"
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
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-brand-dark dark:text-gray-300">
                              {/* Shipping & Delivery Address */}
                              <div className="space-y-3 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-brand-border dark:border-zinc-800 shadow-2xs">
                                <h4 className="font-black text-brand-blue-dark dark:text-brand-blue text-[10px] uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border dark:border-zinc-800 pb-2">
                                  <MapPin size={13} /> Delivery Shipping Address
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

                              {/* Order Summary & Pricing Details */}
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
                                      <span>Coupon Savings:</span>
                                      <span className="font-bold">-₹{parseFloat(order.discount_amount).toLocaleString()}</span>
                                    </div>
                                  )}
                                  {(() => {
                                    const rawShipping = (parseFloat(order.net_price) || 0) - ((parseFloat(order.total_price) || 0) - (parseFloat(order.discount_amount) || 0));
                                    const shippingCharged = Math.max(0, rawShipping);
                                    return shippingCharged > 0 ? (
                                      <div className="flex justify-between text-brand-blue dark:text-brand-blue-light">
                                        <span>Shipping & Handling:</span>
                                        <span className="font-bold">₹{shippingCharged.toLocaleString()}</span>
                                      </div>
                                    ) : null;
                                  })()}
                                  <div className="flex justify-between">
                                    <span className="text-brand-grey dark:text-zinc-400">Gateway:</span>
                                    <span className="font-bold uppercase text-[10px] tracking-wider">{order.payment_method}</span>
                                  </div>
                                  <div className="border-t border-brand-border dark:border-zinc-800 pt-2 flex justify-between font-black text-sm text-brand-dark dark:text-white">
                                    <span>Net Receipt:</span>
                                    <span>₹{parseFloat(order.net_price).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Purchased Formulations */}
                              <div className="space-y-3 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-brand-border dark:border-zinc-800 shadow-2xs md:col-span-1">
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

export default AdminOrders;
