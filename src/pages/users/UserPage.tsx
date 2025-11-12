import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Button } from '@mui/joy';
import { DeleteForever } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import SharedHeader from '../../components/appComponents/SharedHeader';
import BrandSidebar from '../../components/appComponents/BrandSidebar';
import BrandModal from './BrandModal';
import { TEXT_PRIMARY } from '../../constants/textColorsConstants';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

const UserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<string>('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [hasAccess, setHasAccess] = useState<boolean>(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedBrandForEdit, setSelectedBrandForEdit] = useState<Brand | null>(null);

  // Available data for modal
  const [availableBrands, setAvailableBrands] = useState<AvailableBrand[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<Platform[]>([]);

  // Loading states
  const [isLoadingDashboards, setIsLoadingDashboards] = useState(false);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isLoadingAvailableBrands, setIsLoadingAvailableBrands] = useState(false);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(false);
  const [isDeletingDashboard, setIsDeletingDashboard] = useState(false);

  const getToken = () => localStorage.getItem('token');

  // Fetch all dashboards
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

        // Set active dashboard from URL or first dashboard
        const dashboardParam = searchParams.get('dashboard');
        if (dashboardParam) {
          setActiveDashboard(dashboardParam);
        } else if (dashboardList.length > 0) {
          setActiveDashboard(dashboardList[0].dashboard_id);
          setSearchParams({ dashboard: dashboardList[0].dashboard_id });
        }
      }
    } catch (error: any) {
      console.error('Error fetching dashboards:', error);
      toast.error('Failed to load dashboards');
    } finally {
      setIsLoadingDashboards(false);
    }
  }, []); // Remove searchParams dependency

  // Check user access and fetch brands for active dashboard
  const fetchUserBrands = useCallback(async () => {
    if (!userId || !activeDashboard) return;

    setIsLoadingBrands(true);
    try {
      const token = getToken();

      // Check access
      const accessResponse = await axios.get(
        `${API_BASE_URL}/api/admin/users/${userId}/dashboards/${activeDashboard}/access`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (accessResponse.data.success && accessResponse.data.data.hasAccess) {
        setHasAccess(true);

        // Fetch brands
        const brandsResponse = await axios.get(
          `${API_BASE_URL}/api/admin/users/${userId}/dashboards/${activeDashboard}/brands`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (brandsResponse.data.success) {
          setBrands(brandsResponse.data.data.brands);
        }
      } else {
        setHasAccess(false);
        setBrands([]);
      }
    } catch (error: any) {
      console.error('Error fetching user brands:', error);
      if (error.response?.status === 404) {
        setHasAccess(false);
        setBrands([]);
      }
    } finally {
      setIsLoadingBrands(false);
    }
  }, [userId, activeDashboard]);

  // Fetch available brands (not assigned)
  const fetchAvailableBrands = async () => {
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
    } catch (error) {
      console.error('Error fetching available brands:', error);
      toast.error('Failed to load available brands');
    } finally {
      setIsLoadingAvailableBrands(false);
    }
  };

  // Fetch platforms for a brand
  const fetchBrandPlatforms = async (brandId: string) => {
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
    } catch (error) {
      console.error('Error fetching brand platforms:', error);
      toast.error('Failed to load platforms');
    } finally {
      setIsLoadingPlatforms(false);
    }
  };

  // Handle dashboard tab change
  const handleDashboardChange = (dashboardId: string) => {
    setActiveDashboard(dashboardId);
    setSearchParams({ dashboard: dashboardId });
  };

  // Handle add brand
  const handleAddBrand = () => {
    setModalMode('add');
    setSelectedBrandForEdit(null);
    fetchAvailableBrands();
    setIsModalOpen(true);
  };

  // Handle grant access (when user has no access)
  const handleGrantAccess = () => {
    setModalMode('add');
    setSelectedBrandForEdit(null);
    fetchAvailableBrands();
    setIsModalOpen(true);
  };

  // Handle edit brand
  const handleEditBrand = async (brandId: string) => {
    const brand = brands.find(b => b.brand_id === brandId);
    if (!brand) return;

    setModalMode('edit');
    setSelectedBrandForEdit(brand);
    
    // Fetch platforms for this brand
    await fetchBrandPlatforms(brandId);
    
    setIsModalOpen(true);
  };

  // Handle delete brand
  const handleDeleteBrand = async (brandId: string) => {
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
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Failed to remove brand');
    }
  };

  // Handle brand modal submit
  const handleBrandModalSubmit = async (brandId: string, platformIds: string[]) => {
    try {
      const token = getToken();
      
      // Use grant-access endpoint if user has no access, otherwise use brands endpoint
      let endpoint, method;
      
      if (!hasAccess && modalMode === 'add') {
        // Grant Access (first time)
        endpoint = `${API_BASE_URL}/api/admin/users/${userId}/dashboards/${activeDashboard}/grant-access`;
        method = 'post';
      } else if (modalMode === 'add') {
        // Add Brand (user already has access)
        endpoint = `${API_BASE_URL}/api/admin/users/${userId}/dashboards/${activeDashboard}/brands`;
        method = 'post';
      } else {
        // Edit Platforms
        endpoint = `${API_BASE_URL}/api/admin/users/${userId}/dashboards/${activeDashboard}/brands/${brandId}/platforms`;
        method = 'put';
      }

      const payload = modalMode === 'add'
        ? { brandId, platformIds }
        : { platformIds };

const methodKey = method as keyof typeof axios;

const response = await (axios[methodKey] as any)(endpoint, payload, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

      if (response.data.success) {
        fetchUserBrands();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error('Error saving brand:', error);
      toast.error(error.response?.data?.message || 'Failed to save brand');
      throw error;
    }
  };

  // Handle delete dashboard access
  const handleDeleteDashboardAccess = async () => {
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
    } catch (error: any) {
      console.error('Error revoking dashboard access:', error);
      toast.error('Failed to revoke access');
    } finally {
      setIsDeletingDashboard(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDashboards();
  }, []); // Empty dependency array - run once on mount

  // Load brands when dashboard changes
  useEffect(() => {
    if (activeDashboard) {
      fetchUserBrands();
    }
  }, [activeDashboard, fetchUserBrands]);

  const activeDashboardData = dashboards.find(d => d.dashboard_id === activeDashboard);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header with Dashboard Tabs */}
      <SharedHeader
        showTabs={true}
        tabs={dashboards.map(d => ({
          id: d.dashboard_id,
          name: d.dashboard_type,
          count: brands.length // Show count of brands for active dashboard only
        }))}
        activeTab={activeDashboard}
        onTabChange={handleDashboardChange}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {isLoadingDashboards ? (
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <CircularProgress sx={{ color: TEXT_PRIMARY.PURPLE }} />
          </div>
        ) : hasAccess ? (
          <>
            {/* Sidebar */}
            <BrandSidebar
              brands={brands}
              isLoading={isLoadingBrands}
              onAddBrand={handleAddBrand}
              onEditBrand={handleEditBrand}
              onDeleteBrand={handleDeleteBrand}
              dashboardName={activeDashboardData?.dashboard_type || ''}
            />

            {/* Main Content */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#FAFAFA',
              position: 'relative'
            }}>
              {/* Placeholder Content */}
              <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: TEXT_PRIMARY.GREY
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                  <h3>Dashboard Content Coming Soon</h3>
                  <p>This area will display dashboard-specific content</p>
                </div>
              </div>

              {/* Revoke Access Button */}
              <div style={{
                position: 'absolute',
                bottom: '24px',
                right: '24px'
              }}>
                <Button
                  variant="solid"
                  color="danger"
                  startDecorator={<DeleteForever />}
                  onClick={handleDeleteDashboardAccess}
                  loading={isDeletingDashboard}
                  disabled={isDeletingDashboard}
                  sx={{
                    backgroundColor: '#D32F2F',
                    ':hover': {
                      backgroundColor: '#B71C1C'
                    }
                  }}
                >
                  Revoke {activeDashboardData?.dashboard_type} Access
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '24px',
            padding: '24px'
          }}>
            <div style={{ fontSize: '64px' }}>🔒</div>
            <h2 style={{ color: TEXT_PRIMARY.BLACK, margin: 0 }}>No Access</h2>
            <p style={{ color: TEXT_PRIMARY.GREY, margin: 0, textAlign: 'center' }}>
              User doesn't have access to <strong>{activeDashboardData?.dashboard_type}</strong> dashboard
            </p>
            <Button
              variant="solid"
              onClick={handleGrantAccess}
              sx={{
                backgroundColor: TEXT_PRIMARY.PURPLE,
                color: '#FFFFFF',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 600,
                ':hover': {
                  backgroundColor: '#7A4CD9'
                }
              }}
            >
              Grant Access
            </Button>
          </div>
        )}
      </div>

      {/* Brand Add/Edit Modal */}
      <BrandModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        dashboardName={activeDashboardData?.dashboard_type || ''}
        dashboardId={activeDashboard}
        userId={userId || ''}
        selectedBrandId={selectedBrandForEdit?.brand_id}
        selectedBrandName={selectedBrandForEdit?.brand_name}
        assignedPlatformIds={selectedBrandForEdit?.platforms.map(p => p.platform_id)}
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