import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Search, ShieldCheck, User, Calendar, ShoppingBag } from 'lucide-react';
import { API } from '../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsersData = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Fetch users list failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const getRoleBadge = (role) => {
    if (role?.toLowerCase() === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] uppercase font-black bg-brand-blue-dark dark:bg-brand-blue text-white border border-brand-blue-dark dark:border-brand-blue shadow-sm">
          <ShieldCheck size={11} /> Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
        <User size={11} /> Customer
      </span>
    );
  };

  // Filter users by search term (name or email)
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute metrics
  const totalUsersCount = users.length;
  const adminUsersCount = users.filter(u => u.role?.toLowerCase() === 'admin').length;
  const customerUsersCount = totalUsersCount - adminUsersCount;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-brand-dark dark:text-white uppercase tracking-tight font-heading">
            Customers Directory
          </h1>
          <p className="text-xs font-semibold text-brand-grey dark:text-gray-400 uppercase tracking-wider font-heading mt-0.5">
            Browse registered laboratory accounts, administrative logs, and user orders
          </p>
        </div>
        <button 
          onClick={fetchUsersData} 
          className="p-2 border border-brand-border dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 hover:bg-brand-bg-grey dark:hover:bg-zinc-855 text-brand-dark dark:text-gray-250 transition-colors"
          title="Refresh Directory"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-5 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider block">Total Directory Accounts</span>
            <span className="text-2xl font-black text-brand-blue">{totalUsersCount}</span>
          </div>
          <div className="p-3 bg-brand-blue-light dark:bg-brand-blue/10 text-brand-blue rounded-full">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-5 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider block">Staff / Administrators</span>
            <span className="text-2xl font-black text-brand-blue-dark dark:text-brand-blue">{adminUsersCount}</span>
          </div>
          <div className="p-3 bg-brand-blue-light dark:bg-brand-blue/10 text-brand-blue-dark dark:text-brand-blue rounded-full">
            <ShieldCheck size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-5 flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider block">Registered Customers</span>
            <span className="text-2xl font-black text-brand-dark dark:text-white">{customerUsersCount}</span>
          </div>
          <div className="p-3 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 rounded-full">
            <User size={20} />
          </div>
        </div>
      </div>

      {/* Directory Table Area */}
      <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
        {/* Search Bar / Table Controls */}
        <div className="p-4 border-b border-brand-border dark:border-zinc-800 bg-brand-bg-grey/30 dark:bg-zinc-800/40 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-grey dark:text-zinc-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Search users by name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-brand-border dark:border-zinc-800 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-blue/50 bg-white dark:bg-zinc-900 text-brand-dark dark:text-white"
            />
          </div>
          <div className="text-[10px] font-bold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">
            Showing {filteredUsers.length} of {totalUsersCount} Directory Entries
          </div>
        </div>

        {/* Directory Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="animate-spin text-brand-blue" size={32} />
            <p className="text-xs font-semibold text-brand-grey dark:text-zinc-400 uppercase tracking-wider">
              Decrypting database listings...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 text-xs text-brand-grey dark:text-zinc-400 font-medium">
            No matching users found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-dark dark:text-gray-250">
              <thead>
                <tr className="border-b border-brand-border dark:border-zinc-800 bg-brand-bg-grey dark:bg-zinc-800/40 text-brand-grey dark:text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">User ID</th>
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">System Access Role</th>
                  <th className="py-4 px-6">Signup Date</th>
                  <th className="py-4 px-6 text-center">Orders Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60 dark:divide-zinc-800/60 font-medium">
                {filteredUsers.map((userObj) => (
                  <tr key={userObj.id} className="hover:bg-brand-bg-grey/30 dark:hover:bg-zinc-850/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-brand-blue">#USR-{userObj.id.toString().substring(0, 8)}...</td>
                    <td className="py-4 px-6 font-bold text-brand-dark dark:text-white">{userObj.name}</td>
                    <td className="py-4 px-6 text-brand-grey dark:text-zinc-400 font-semibold">{userObj.email}</td>
                    <td className="py-4 px-6">{getRoleBadge(userObj.role)}</td>
                    <td className="py-4 px-6 text-brand-grey dark:text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-brand-grey/80 dark:text-zinc-400" />
                        {new Date(userObj.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-brand-dark dark:text-white">
                      <div className="inline-flex items-center gap-1 bg-brand-blue-light/30 dark:bg-brand-blue/10 px-2 py-0.5 rounded text-brand-blue text-[10px]">
                        <ShoppingBag size={10} />
                        {userObj.orderCount || 0}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
