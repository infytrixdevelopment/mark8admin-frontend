import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import SharedHeader from '../../components/appComponents/SharedHeader';
import { Box, CircularProgress } from '@mui/joy';
import axios from 'axios';
import toast from 'react-hot-toast';

import { BASE_URL } from '../../constants/appConstants';

// API Base URL

// Define the type for the tabs
type AppTabInfo = {
  tabs: Array<{ id: string; name: string; count?: number }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

// This type will be used by child components
type AppContextType = {
  setAppTabInfo: React.Dispatch<React.SetStateAction<AppTabInfo | null>>;
};

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [appTabInfo, setAppTabInfo] = useState<AppTabInfo | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // No token, redirect immediately
        navigate('/login', { replace: true });
        return;
      }

      try {
        // Verify token with backend by making a test API call
        const response = await axios.get(`${BASE_URL}api/admin/apps`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 200) {
          // Token is valid, allow access
          setIsCheckingToken(false);
        } else {
          throw new Error('Invalid token');
        }
      } catch (error: any) {
        console.error('Token validation failed:', error);
        
        // Clear all localStorage data
        localStorage.removeItem('token');
        localStorage.removeItem('user_id');
        localStorage.removeItem('full_name');
        localStorage.removeItem('user_type');
        
        if (error.response?.status === 401) {
          toast.error('Session expired or unauthorized. Please login again.');
        } else {
          toast.error('Authentication failed. Please login again.');
        }
        
        navigate('/login', { replace: true });
      }
    };

    validateToken();
  }, [navigate]);

  // Add axios interceptor for global 401 handling
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('full_name');
          localStorage.removeItem('user_type');
          
          toast.error('Session expired. Please login again.');
          navigate('/login', { replace: true });
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // Show loading screen while checking token
  if (isCheckingToken) {
    return (
      <Box sx={{ 
        display: 'flex', 
        width: '100vw', 
        height: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#F9FAFB'
      }}>
        <CircularProgress sx={{ color: '#8E59FF' }} />
      </Box>
    );
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex', 
      flexDirection: 'column', 
      boxSizing: 'border-box',
      margin: '0px',
    }}>
      <SharedHeader
        showTabs={!!appTabInfo} 
        tabs={appTabInfo?.tabs}
        activeTab={appTabInfo?.activeTab}
        onTabChange={appTabInfo?.onTabChange}
      />
      <div style={{ 
        flex: 1, 
        height: appTabInfo ? 'calc(100vh - 92px)' : 'calc(100vh - 50px)', 
        overflow: 'auto' 
      }}>
        <Outlet context={{ setAppTabInfo } satisfies AppContextType} />
      </div>
    </div>
  );
};

export function useAdminLayout() {
  return useOutletContext<AppContextType>();
}

export default AdminLayout;