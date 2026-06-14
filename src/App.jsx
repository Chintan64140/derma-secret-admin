import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AdminLayout from './pages/AdminLayout';
import Dashboard from './pages/Dashboard';
import AdminProducts from './pages/AdminProducts';
import AdminProductForm from './pages/AdminProductForm';
import AdminOrders from './pages/AdminOrders';
import AdminReturns from './pages/AdminReturns';
import AdminUsers from './pages/AdminUsers';
import AdminCategories from './pages/AdminCategories';
import AdminConcerns from './pages/AdminConcerns';
import AdminCoupons from './pages/AdminCoupons';
import AdminSupport from './pages/AdminSupport';
import AdminCMS from './pages/AdminCMS';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Console Layout Routes */}
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/create" element={<AdminProductForm />} />
              <Route path="products/edit/:id" element={<AdminProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="concerns" element={<AdminConcerns />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="returns" element={<AdminReturns />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="support" element={<AdminSupport />} />
              <Route path="cms" element={<AdminCMS />} />
            </Route>

            {/* Fallback Catch-all redirection */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
