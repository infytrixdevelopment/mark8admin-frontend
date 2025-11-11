import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminHeader from './AdminHeader';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{
      height: '100vh',
      boxSizing: 'border-box',
      margin: '0px',
    }}>
      <AdminHeader />
      <div style={{ height: 'calc(100vh - 50px)' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;