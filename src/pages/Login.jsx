import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Status States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if already logged in and is admin
  useEffect(() => {
    if (user && isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.message);
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg-grey dark:bg-[#121212] flex items-center justify-center px-4 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 animate-fade-up">
        {/* Visual Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-brand-blue-light dark:bg-brand-blue/10 text-brand-blue dark:text-brand-blue rounded-full mb-2">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-dark dark:text-white uppercase tracking-tight font-heading">
            Fixderma Lab Console
          </h1>
          <p className="text-xs font-semibold text-brand-grey dark:text-gray-400 uppercase tracking-wider font-heading">
            Administrator Secure Authentication Portal
          </p>
        </div>

        {/* Login Card Panel */}
        <div className="bg-white dark:bg-zinc-900 border border-brand-border dark:border-zinc-800 rounded-xl p-6 sm:p-8 shadow-md space-y-6 transition-all duration-300">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-brand-accent dark:text-red-400 text-xs font-semibold rounded-md flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-brand-grey dark:text-gray-400 uppercase tracking-wider mb-1">Admin Email Address *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grey dark:text-gray-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-brand-border dark:border-zinc-800 dark:bg-zinc-800 text-brand-dark dark:text-white rounded-md text-xs focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                  placeholder="admin@fixderma.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-brand-grey dark:text-gray-400 uppercase tracking-wider mb-1">Secret Password *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-grey dark:text-gray-400">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-brand-border dark:border-zinc-800 dark:bg-zinc-800 text-brand-dark dark:text-white rounded-md text-xs focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-grey hover:text-brand-dark dark:text-gray-400"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded font-bold font-heading text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <LogIn size={15} /> {loading ? 'Authorizing Session...' : 'Authenticate'}
            </button>
          </form>

          <div className="border-t border-brand-border dark:border-zinc-800 pt-4 text-center flex flex-col gap-2">
            <p className="text-xs text-brand-grey dark:text-gray-400 font-medium">
              Need administrator access?{' '}
              <button 
                onClick={() => navigate('/register')} 
                className="text-brand-blue dark:text-brand-blue font-bold hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                Register Admin Account
              </button>
            </p>
            <a 
              href="http://localhost:5173" 
              className="text-xs text-brand-grey dark:text-gray-400 hover:text-brand-dark dark:hover:text-white transition-colors"
            >
              ← Back to Storefront
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
