import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingCart, Package, Users, Activity, RefreshCw, ClipboardList } from 'lucide-react';
import { API } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const res = await API.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Fetch dashboard stats failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/40';
      case 'shipped':
        return 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/40';
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40';
      default:
        return 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/40';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <RefreshCw className="animate-spin text-brand-blue" size={32} />
        <p className="text-xs font-semibold text-brand-grey dark:text-gray-400 uppercase tracking-wider font-heading">
          Aggregating laboratory sales analytics...
        </p>
      </div>
    );
  }

  const { summary = {}, shippingBreakout = {}, recentOrders = [] } = stats || {};

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-brand-dark dark:text-white uppercase tracking-tight font-heading">
          Dashboard Analytics
        </h1>
        <p className="text-xs font-semibold text-brand-grey dark:text-gray-400 uppercase tracking-wider font-heading mt-0.5">
          Real-time metrics for products, users, and transactions
        </p>
      </div>

      {/* 1. Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sales */}
        <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-5 flex items-center justify-between shadow-xs transition-colors duration-300">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-grey dark:text-gray-400 uppercase tracking-wider block">Total Sales</span>
            <span className="text-2xl font-black text-brand-blue">₹{parseFloat(summary.totalSales || 0).toLocaleString()}</span>
          </div>
          <div className="p-3 bg-brand-blue-light dark:bg-brand-blue/10 text-brand-blue rounded-full">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-5 flex items-center justify-between shadow-xs transition-colors duration-300">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-grey dark:text-gray-400 uppercase tracking-wider block">Total Orders</span>
            <span className="text-2xl font-black text-brand-dark dark:text-white">{summary.totalOrders || 0}</span>
          </div>
          <div className="p-3 bg-brand-blue-light dark:bg-brand-blue/10 text-brand-blue rounded-full">
            <ShoppingCart size={22} />
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-5 flex items-center justify-between shadow-xs transition-colors duration-300">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-grey dark:text-gray-400 uppercase tracking-wider block">Formulations</span>
            <span className="text-2xl font-black text-brand-dark dark:text-white">{summary.totalProducts || 0}</span>
          </div>
          <div className="p-3 bg-brand-blue-light dark:bg-brand-blue/10 text-brand-blue rounded-full">
            <Package size={22} />
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-5 flex items-center justify-between shadow-xs transition-colors duration-300">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-grey dark:text-gray-400 uppercase tracking-wider block">Registered Users</span>
            <span className="text-2xl font-black text-brand-dark dark:text-white">{summary.totalUsers || 0}</span>
          </div>
          <div className="p-3 bg-brand-blue-light dark:bg-brand-blue/10 text-brand-blue rounded-full">
            <Users size={22} />
          </div>
        </div>
      </div>

      {/* 2. Order Status breakout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Status count card */}
        <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-6 space-y-6 shadow-xs lg:col-span-1 transition-colors duration-300">
          <h2 className="text-sm font-bold text-brand-dark dark:text-white font-heading uppercase tracking-wide border-b border-brand-border dark:border-zinc-800 pb-2 flex items-center gap-2">
            <Activity size={16} className="text-brand-blue" /> Dispatch Statuses
          </h2>
          
          <div className="space-y-4">
            {/* Pending */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-brand-dark dark:text-gray-250">
                <span>Pending Orders</span>
                <span>{shippingBreakout.pending || 0}</span>
              </div>
              <div className="w-full bg-gray-150 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-yellow-500 h-full"
                  style={{ width: `${(shippingBreakout.pending / (summary.totalOrders || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Shipped */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-brand-dark dark:text-gray-250">
                <span>Shipped Packets</span>
                <span>{shippingBreakout.shipped || 0}</span>
              </div>
              <div className="w-full bg-gray-150 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full"
                  style={{ width: `${(shippingBreakout.shipped / (summary.totalOrders || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Delivered */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-brand-dark dark:text-gray-250">
                <span>Delivered Packets</span>
                <span>{shippingBreakout.delivered || 0}</span>
              </div>
              <div className="w-full bg-gray-150 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full"
                  style={{ width: `${(shippingBreakout.delivered / (summary.totalOrders || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Cancelled */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-brand-dark dark:text-gray-250">
                <span>Cancelled Orders</span>
                <span>{shippingBreakout.cancelled || 0}</span>
              </div>
              <div className="w-full bg-gray-150 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-red-500 h-full"
                  style={{ width: `${(shippingBreakout.cancelled / (summary.totalOrders || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Recent Transactions table */}
        <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-6 space-y-4 shadow-xs lg:col-span-2 overflow-x-auto transition-colors duration-300">
          <div className="flex justify-between items-center border-b border-brand-border dark:border-zinc-800 pb-2">
            <h2 className="text-sm font-bold text-brand-dark dark:text-white font-heading uppercase tracking-wide flex items-center gap-2">
              <ClipboardList size={16} className="text-brand-blue" /> Recent Orders
            </h2>
            <Link
              to="/orders"
              className="text-[10px] font-bold text-brand-blue hover:underline uppercase tracking-wider"
            >
              Manage All Orders
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-10 text-xs text-brand-grey dark:text-gray-400 font-medium">No order placements found in database.</div>
          ) : (
            <table className="w-full text-left text-xs text-brand-dark dark:text-gray-200">
              <thead>
                <tr className="border-b border-brand-border/60 dark:border-zinc-800/80 text-brand-grey dark:text-gray-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Order ID</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Shipping</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 dark:divide-zinc-850 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-brand-bg-grey/50 dark:hover:bg-zinc-800/40">
                    <td className="py-3.5 px-2 font-bold text-brand-blue">#FD-{ord.id}</td>
                    <td className="py-3.5 px-2 truncate max-w-[120px]" title={ord.shipping_name}>{ord.shipping_name}</td>
                    <td className="py-3.5 px-2 font-bold">₹{parseFloat(ord.net_price)}</td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${getStatusStyle(ord.shipping_status)}`}>
                        {ord.shipping_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <Link
                        to="/orders"
                        className="text-[10px] font-bold text-brand-accent hover:underline uppercase"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
