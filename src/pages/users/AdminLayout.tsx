import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useOutletContext } from 'react-router-dom';
import SharedHeader from '../../components/appComponents/SharedHeader';

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
  // State to hold tab info from the child route
  const [appTabInfo, setAppTabInfo] = useState<AppTabInfo | null>(null);

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
      display: 'flex', // Use flex
      flexDirection: 'column', // Arrange children vertically
      boxSizing: 'border-box',
      margin: '0px',
    }}>
      <SharedHeader
        showTabs={!!appTabInfo} // Show tabs only if appTabInfo is set
        tabs={appTabInfo?.tabs}
        activeTab={appTabInfo?.activeTab}
        onTabChange={appTabInfo?.onTabChange}
      />
      <div style={{ 
        flex: 1, // This makes the content area fill the remaining space
        height: 'calc(100vh - 50px)', // Fallback height
        overflow: 'auto' // Add scroll to content area
      }}>
        {/* Pass the 'setAppTabInfo' function down to the child routes */}
        <Outlet context={{ setAppTabInfo } satisfies AppContextType} />
      </div>
    </div>
  );
};

// Custom hook for child components to use
export function useAdminLayout() {
  return useOutletContext<AppContextType>();
}

export default AdminLayout;