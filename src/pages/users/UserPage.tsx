import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CircularProgress, Button, Box, Typography } from '@mui/joy';
import { DeleteForever, Person, Email, Business, Badge } from '@mui/icons-material'; // 1. Import new icons
import axios from 'axios';
import toast from 'react-hot-toast';
import BrandSidebar from '../../components/appComponents/BrandSidebar';
import BrandModal from './BrandModal';
import { TEXT_PRIMARY } from '../../constants/textColorsConstants';
import { useAdminLayout } from './AdminLayout';

// --- TYPE DEFINITIONS ---
type Dashboard = {
  dashboard_id: string;
  dashboard_type: string;
  color?: string;
  status: string;
};

type Platform = {
  platform_id: string;
  platform_name: string;
  platform_logo_url?: string;
};

type Brand = {
  brand_id: string;
  brand_name: string;
  company_name?: string;
  platforms: Platform[];
};

type AvailableBrand = {
  brand_id: string;
  brand_name: string;
};

// 2. UPDATED USER TYPE
type User = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  user_type: string;     // Added
  organisation: string;  // Added
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// --- COMPONENT ---
const UserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setTabInfo } = useAdminLayout();

  // --- STATES ---
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<string>('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedBrandForEdit, setSelectedBrandForEdit] = useState<Brand | null>(null);
  const [availableBrands, setAvailableBrands] = useState<AvailableBrand[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<Platform[]>([]);
  const [isLoadingDashboards, setIsLoadingDashboards] = useState(true);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isLoadingAvailableBrands, setIsLoadingAvailableBrands] = useState(false);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(false);
  const [isDeletingDashboard, setIsDeletingDashboard] = useState(false);

  const getToken = () => localStorage.getItem('token');

  // --- API FUNCTIONS (MEMOIZED) ---
  const fetchUserInfo = useCallback(async () => {
    if (!userId) return;
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUserInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      toast.error('Failed to load user information');
    }
  }, [userId]);

  const fetchDashboards = useCallback(async () => {
    setIsLoadingDashboards(true);
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/api/admin/dashboards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const dashboardList = response.data.data.dashboards;
        setDashboards(dashboardList);
        const dashboardParam = searchParams.get('dashboard');
        if (dashboardParam && dashboardList.some((d: Dashboard) => d.dashboard_id === dashboardParam)) {
          setActiveDashboard(dashboardParam);
        } else if (dashboardList.length > 0) {
          const firstDashboardId = dashboardList[0].dashboard_id;
          setActiveDashboard(firstDashboardId);
          if (dashboardParam !== firstDashboardId) {
            setSearchParams({ dashboard: firstDashboardId }, { replace: true });
          }
        }
      }
    } catch (error: any) { toast.error('Failed to load dashboards');
    } finally { setIsLoadingDashboards(false); }
  }, [searchParams, setSearchParams]);

  const fetchUserBrands = useCallback(async () => {
    if (!userId || !activeDashboard) return;
    setIsLoadingBrands(true);
    setHasAccess(false);
    try {
      const token = getToken();
      const accessResponse = await axios.get(
        `${API_BASE_URL}/api/admin/users/${userId}/dashboards/${activeDashboard}/access`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (accessResponse.data.success && accessResponse.data.data.hasAccess) {
        setHasAccess(true);
        const brandsResponse = await axios.get(
          `${API_BASE_URL}/api/admin/users/${userId}/dashboards/${activeDashboard}/brands`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (brandsResponse.data.success) {
          const fetchedBrands = brandsResponse.data.data.brands;
          setBrands(fetchedBrands);
          setBrandCounts(prev => ({ ...prev, [activeDashboard]: fetchedBrands.length }));
        }
      } else {
        setHasAccess(false);
        setBrands([]);
        setBrandCounts(prev => ({ ...prev, [activeDashboard]: 0 }));
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setHasAccess(false);
        setBrands([]);
        setBrandCounts(prev => ({ ...prev, [activeDashboard]: 0 }));
      }
    } finally {
      setIsLoadingBrands(false);
    }
  }, [userId, activeDashboard]);

  const fetchBrandPlatforms = useCallback(async (brandId: string) => {
    setIsLoadingPlatforms(true);
    try {
      const token = getToken();
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/brands/${brandId}/platforms`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setAvailablePlatforms(response.data.data.platforms);
      }
    } catch (error) { toast.error('Failed to load platforms');
    } finally { setIsLoadingPlatforms(false); }
  }, []);

  const handleBrandModalSubmit = useCallback(async (brandId: string, platformIds: string[]) => {
    try {
      const token = getToken();
      let endpoint, method;
      if (!hasAccess && modalMode === 'add') {
        endpoint = `${API_BASE_URL}/api/admin/users/${userId}/dashboards/${activeDashboard}/grant-access`;
        method = 'post';
      } else if (modalMode === 'add') {
        endpoint = `${API_BASE_URL}/api/admin/users/${userId}/dashboards/${activeDashboard}/brands`;
        method = 'post';
      } else {
        endpoint = `${API_BASE_URL}/api/admin/users/${userId}/dashboards/${activeDashboard}/brands/${brandId}/platforms`;
        method = 'put';
      }
      const payload = modalMode === 'add' ? { brandId, platformIds } : { platformIds };
      const methodKey = method as keyof typeof axios;
      const response = await (axios[methodKey] as any)(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.data.success) {
        fetchUserBrands();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save brand');
      throw error;
    }
  }, [hasAccess, modalMode, userId, activeDashboard, fetchUserBrands]);

  const handleDashboardChange = useCallback((dashboardId: string) => {
    setActiveDashboard(dashboardId);
    setSearchParams({ dashboard: dashboardId }, { replace: true });
  }, [setSearchParams]);

  const fetchAvailableBrands = useCallback(async () => {
    if (!userId || !activeDashboard) return;
    setIsLoadingAvailableBrands(true);
    try {
      const token = getToken();
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/brands/available`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId, dashboardId: activeDashboard }
        }
      );
      if (response.data.success) {
        setAvailableBrands(response.data.data.brands);
      }
    } catch (error) { toast.error('Failed to load available brands');
    } finally { setIsLoadingAvailableBrands(false); }
  }, [userId, activeDashboard]);
  
  const handleAddBrand = useCallback(() => {
    setModalMode('add');
    setSelectedBrandForEdit(null);
    fetchAvailableBrands();
    setIsModalOpen(true);
  }, [fetchAvailableBrands]);

  const handleGrantAccess = useCallback(() => {
    setModalMode('add');
    setSelectedBrandForEdit(null);
    fetchAvailableBrands();
    setIsModalOpen(true);
  }, [fetchAvailableBrands]);

  const handleEditBrand = useCallback(async (brandId: string) => {
    const brand = brands.find(b => b.brand_id === brandId);
    if (!brand) return;
    setModalMode('edit');
    setSelectedBrandForEdit(brand);
    await fetchBrandPlatforms(brandId);
    setIsModalOpen(true);
  }, [brands, fetchBrandPlatforms]);

  const handleDeleteBrand = useCallback(async (brandId: string) => {
    if (!window.confirm('Are you sure you want to remove this brand?')) return;
    try {
      const token = getToken();
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/users/${userId}/dashboards/${activeDashboard}/brands/${brandId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success('Brand removed successfully');
        fetchUserBrands();
      }
    } catch (error) { toast.error('Failed to remove brand'); }
  }, [userId, activeDashboard, fetchUserBrands]);

  const handleDeleteDashboardAccess = useCallback(async () => {
    const dashboardName = dashboards.find(d => d.dashboard_id === activeDashboard)?.dashboard_type;
    if (!window.confirm(`Are you sure you want to revoke access to ${dashboardName} dashboard? This will remove all brands and platforms.`)) {
      return;
    }
    setIsDeletingDashboard(true);
    try {
      const token = getToken();
      const response = await axios.delete(
        `${API_BASE_URL}/api/admin/users/${userId}/dashboards/${activeDashboard}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success('Dashboard access revoked successfully');
        fetchUserBrands();
      }
    } catch (error: any) { toast.error('Failed to revoke access');
    } finally { setIsDeletingDashboard(false); }
  }, [userId, activeDashboard, dashboards, fetchUserBrands]);

  // --- EFFECTS ---
  useEffect(() => {
    if (dashboards.length > 0) {
      setTabInfo({
        tabs: dashboards.map(d => ({
          id: d.dashboard_id,
          name: d.dashboard_type,
          count: brandCounts[d.dashboard_id]
        })),
        activeTab: activeDashboard,
        onTabChange: handleDashboardChange,
      });
    }
    return () => {
      setTabInfo(null);
    };
  }, [setTabInfo, dashboards, activeDashboard, brandCounts, handleDashboardChange]);
  
  useEffect(() => {
    fetchDashboards();
    fetchUserInfo();
  }, [fetchDashboards, fetchUserInfo]);

  useEffect(() => {
    if (activeDashboard) {
      fetchUserBrands();
    }
  }, [activeDashboard, fetchUserBrands]);

  const activeDashboardData = dashboards.find(d => d.dashboard_id === activeDashboard);

  const memoizedAssignedPlatformIds = useMemo(() => {
    return selectedBrandForEdit?.platforms.map(p => p.platform_id);
  }, [selectedBrandForEdit]);

  // 3. --- REDESIGNED USER INFO BAR ---
  // This component will be rendered *inside* the pageContent function
  const UserInfoBar = () => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap', // Allow wrapping on small screens
        gap: 3,
        p: 2,
        backgroundColor: '#FFFFFF',
        border: '1px solid #ECF0FF',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        mb: 2, // Margin bottom to separate from content
      }}
    >
      {userInfo ? (
        <>
          {/* User Name */}
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography level="body-xs" sx={{ color: TEXT_PRIMARY.GREY }}>User Name</Typography>
            <Typography level="title-sm" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Person sx={{ fontSize: '18px', color: TEXT_PRIMARY.PURPLE }} />
              {userInfo.first_name} {userInfo.last_name}
            </Typography>
          </Box>
          
          {/* Email */}
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography level="body-xs" sx={{ color: TEXT_PRIMARY.GREY }}>Email</Typography>
            <Typography level="title-sm" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, wordBreak: 'break-all' }}>
              <Email sx={{ fontSize: '18px', color: TEXT_PRIMARY.PURPLE }} />
              {userInfo.email}
            </Typography>
          </Box>

          {/* User Type */}
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Typography level="body-xs" sx={{ color: TEXT_PRIMARY.GREY }}>User Type</Typography>
            <Typography level="title-sm" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
              <Badge sx={{ fontSize: '18px', color: TEXT_PRIMARY.PURPLE }} />
              {userInfo.user_type}
            </Typography>
          </Box>

          {/* Organisation */}
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Typography level="body-xs" sx={{ color: TEXT_PRIMARY.GREY }}>Organisation</Typography>
            <Typography level="title-sm" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Business sx={{ fontSize: '18px', color: TEXT_PRIMARY.PURPLE }} />
              {userInfo.organisation}
            </Typography>
          </Box>

          {/* Status */}
          <Box sx={{ flex: '0 1 auto', ml: 'auto', alignSelf: 'center' }}>
            <Typography
              sx={{
                padding: '4px 12px',
                borderRadius: '16px',
                fontWeight: 600,
                fontSize: '12px',
                color: userInfo.status === 'ACTIVE' ? '#1A8A5C' : '#D32F2F',
                backgroundColor: userInfo.status === 'ACTIVE' ? '#E5F3ED' : '#FCE7E7',
              }}
            >
              {userInfo.status}
            </Typography>
          </Box>
        </>
      ) : (
        <Typography level="body-sm" sx={{ color: TEXT_PRIMARY.GREY }}>
          Loading user info...
        </Typography>
      )}
    </Box>
  );

  // --- RENDER ---
  const pageContent = () => {
    if (isLoadingDashboards) {
      return (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress sx={{ color: TEXT_PRIMARY.PURPLE }} />
        </div>
      );
    }
    
    // "No Access" view
    if (!hasAccess && !isLoadingBrands) {
      return (
        // 4. MOVED UserInfoBar here
        <Box sx={{ p: 2, backgroundColor: '#F9FAFB' }}>
          <UserInfoBar />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '24px', padding: '24px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #ECF0FF' }}>
            <div style={{ fontSize: '64px' }}>🔒</div>
            <h2 style={{ color: TEXT_PRIMARY.BLACK, margin: 0 }}>No Access</h2>
            <p style={{ color: TEXT_PRIMARY.GREY, margin: 0, textAlign: 'center' }}>
              User doesn't have access to <strong>{activeDashboardData?.dashboard_type}</strong> dashboard
            </p>
            <Button
              variant="solid"
              onClick={handleGrantAccess}
              sx={{ backgroundColor: TEXT_PRIMARY.PURPLE, color: '#FFFFFF', padding: '10px 24px', fontSize: '14px', fontWeight: 600, ':hover': { backgroundColor: '#7A4CD9' }}}
            >
              Grant Access
            </Button>
          </div>
        </Box>
      );
    }

    // "Has Access" view (or is loading brands)
    if (hasAccess || isLoadingBrands) {
      return (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: '100%' }}>
          <BrandSidebar
            brands={brands}
            isLoading={isLoadingBrands}
            onAddBrand={handleAddBrand}
            onEditBrand={handleEditBrand}
            onDeleteBrand={handleDeleteBrand}
            dashboardName={activeDashboardData?.dashboard_type || ''}
          />
          {/* 5. MOVED UserInfoBar here */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FAFAFB',
            position: 'relative',
            overflow: 'auto', // Add scroll to this panel
            padding: '16px' // Add padding
          }}>
            
            <UserInfoBar />

            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: TEXT_PRIMARY.GREY,
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #ECF0FF',
              minHeight: '300px' // Give it some min height
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <h3>Dashboard Content Coming Soon</h3>
                <p>This area will display dashboard-specific content</p>
              </div>
            </div>

            <div style={{
              position: 'sticky', // Stick to the bottom of this scrolling panel
              bottom: '16px',
              marginTop: '16px', // Add space above
              alignSelf: 'flex-end'
            }}>
              <Button
                variant="solid"
                color="danger"
                startDecorator={<DeleteForever />}
                onClick={handleDeleteDashboardAccess}
                loading={isDeletingDashboard}
                disabled={isDeletingDashboard}
                sx={{ backgroundColor: '#D32F2F', ':hover': { backgroundColor: '#B71C1C' }}}
              >
                Revoke {activeDashboardData?.dashboard_type} Access
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Fallback loading
    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress sx={{ color: TEXT_PRIMARY.PURPLE }} />
      </div>
    );
  };
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* 6. REMOVED the UserInfoBar from here */}

      {/* The main content now fills the space, and UserInfoBar is *inside* it */}
      <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: '#F9FAFB' }}>
        {pageContent()}
      </Box>

      <BrandModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        dashboardName={activeDashboardData?.dashboard_type || ''}
        dashboardId={activeDashboard}
        userId={userId || ''}
        selectedBrandId={selectedBrandForEdit?.brand_id}
        selectedBrandName={selectedBrandForEdit?.brand_name}
        assignedPlatformIds={memoizedAssignedPlatformIds}
        availableBrands={availableBrands}
        availablePlatforms={availablePlatforms}
        isLoadingBrands={isLoadingAvailableBrands}
        isLoadingPlatforms={isLoadingPlatforms}
        onFetchPlatforms={fetchBrandPlatforms}
        onSubmit={handleBrandModalSubmit}
      />
    </div>
  );
};

export default UserPage;