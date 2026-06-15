import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ClipboardList, Users, ShieldAlert, ArrowLeft, LogOut, Sun, Moon, Sliders, Tag, RefreshCw, MessageSquare, Sparkles, Image, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AdminLayout = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme, isDarkMode } = useTheme();

  // Highlight active path
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="inline-flex p-4 bg-red-50 dark:bg-red-950/20 text-brand-accent dark:text-red-400 rounded-full border border-red-100 dark:border-red-900/40 shadow-sm animate-bounce">
          <ShieldAlert size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-brand-dark dark:text-white uppercase tracking-tight font-heading">
            Access Unauthorized
          </h1>
          <p className="text-xs text-brand-grey dark:text-gray-400 font-medium leading-relaxed">
            You do not have administrative clearance to access the laboratory dashboard portal. Please sign in with an administrator account.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-4">
          <Link
            to="/login"
            className="px-5 py-2.5 bg-brand-blue text-white rounded font-bold font-heading text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          >
            Go to Login
          </Link>
         
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg-grey dark:bg-[#121212] flex transition-colors duration-300">
      {/* 1. Sidebar Navigation */}
      <aside className="w-64 bg-brand-blue-dark text-white flex-shrink-0 flex flex-col justify-between hidden md:flex border-r border-white/5">
        <div className="p-6 space-y-8">
          {/* Admin title */}
          <div className="space-y-1">
            <h2 className="text-xs font-black text-brand-yellow uppercase tracking-widest font-heading">Fixderma Lab</h2>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Admin Control Desk</p>
          </div>

          {/* Links list */}
          <nav className="space-y-1">
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider font-heading transition-all ${
                isActive('/') 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>

            <Link
              to="/products"
              className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider font-heading transition-all ${
                isActive('/products') 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ShoppingBag size={16} /> Products Catalog
            </Link>

            <Link
              to="/categories"
              className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider font-heading transition-all ${
                isActive('/categories') 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Sliders size={16} /> Categories Catalog
            </Link>

            <Link
              to="/concerns"
              className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider font-heading transition-all ${
                isActive('/concerns') 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Sparkles size={16} /> Concerns Catalog
            </Link>

            <Link
              to="/orders"
              className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider font-heading transition-all ${
                isActive('/orders') 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <ClipboardList size={16} /> Order Management
            </Link>

            <Link
              to="/returns"
              className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider font-heading transition-all ${
                isActive('/returns') 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <RefreshCw size={16} /> Returns & Refunds
            </Link>

            <Link
              to="/users"
              className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider font-heading transition-all ${
                isActive('/users') 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users size={16} /> Customers Directory
            </Link>

            <Link
              to="/coupons"
              className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider font-heading transition-all ${
                isActive('/coupons') 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Tag size={16} /> Coupons Manager
            </Link>

            <Link
              to="/support"
              className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider font-heading transition-all ${
                isActive('/support') 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MessageSquare size={16} /> Support Chat
            </Link>

            <Link
              to="/cms"
              className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider font-heading transition-all ${
                isActive('/cms') 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Image size={16} /> Hero Banner CMS
            </Link>

            <Link
              to="/shipping"
              className={`flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider font-heading transition-all ${
                isActive('/shipping') 
                  ? 'bg-brand-blue text-white shadow-md' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Truck size={16} /> Shipping Settings
            </Link>
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-6 border-t border-white/5 space-y-4">
         
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-accent hover:text-red-400 transition-colors w-full text-left"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header bar */}
        <header className="bg-white dark:bg-[#1a1a1a] border-b border-brand-border dark:border-zinc-800 h-16 flex items-center justify-between px-6 transition-colors duration-300">
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-xs font-black text-brand-blue dark:text-white uppercase tracking-widest font-heading">Fixderma Lab</span>
          </div>
          
          <div className="text-xs font-semibold text-brand-grey dark:text-zinc-400 uppercase tracking-wider hidden sm:block">
            Signed in as: <strong className="text-brand-dark dark:text-white">{user?.name}</strong>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-full hover:bg-brand-bg-grey text-brand-dark hover:text-brand-blue transition-colors focus:outline-none dark:hover:bg-zinc-800 dark:text-zinc-200 dark:hover:text-brand-blue"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Quick links for mobile view */}
            <div className="flex md:hidden gap-3">
              <Link to="/" className="text-brand-dark hover:text-brand-blue p-1.5 dark:text-zinc-300 dark:hover:text-white"><LayoutDashboard size={18} /></Link>
              <Link to="/products" className="text-brand-dark hover:text-brand-blue p-1.5 dark:text-zinc-300 dark:hover:text-white"><ShoppingBag size={18} /></Link>
              <Link to="/categories" className="text-brand-dark hover:text-brand-blue p-1.5 dark:text-zinc-300 dark:hover:text-white" title="Categories"><Sliders size={18} /></Link>
              <Link to="/concerns" className="text-brand-dark hover:text-brand-blue p-1.5 dark:text-zinc-300 dark:hover:text-white" title="Concerns"><Sparkles size={18} /></Link>
              <Link to="/orders" className="text-brand-dark hover:text-brand-blue p-1.5 dark:text-zinc-300 dark:hover:text-white"><ClipboardList size={18} /></Link>
              <Link to="/returns" className="text-brand-dark hover:text-brand-blue p-1.5 dark:text-zinc-300 dark:hover:text-white" title="Returns"><RefreshCw size={18} /></Link>
              <Link to="/users" className="text-brand-dark hover:text-brand-blue p-1.5 dark:text-zinc-300 dark:hover:text-white"><Users size={18} /></Link>
              <Link to="/coupons" className="text-brand-dark hover:text-brand-blue p-1.5 dark:text-zinc-300 dark:hover:text-white" title="Coupons"><Tag size={18} /></Link>
              <Link to="/support" className="text-brand-dark hover:text-brand-blue p-1.5 dark:text-zinc-300 dark:hover:text-white" title="Support Chat"><MessageSquare size={18} /></Link>
              <Link to="/cms" className="text-brand-dark hover:text-brand-blue p-1.5 dark:text-zinc-300 dark:hover:text-white" title="Hero Banner CMS"><Image size={18} /></Link>
              <Link to="/shipping" className="text-brand-dark hover:text-brand-blue p-1.5 dark:text-zinc-300 dark:hover:text-white" title="Shipping Settings"><Truck size={18} /></Link>
 
              <button onClick={() => logout()} className="text-brand-accent p-1.5"><LogOut size={18} /></button>
            </div>
          </div>
        </header>

        {/* Dashboard Pages Slot */}
        <main className="p-6 overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
