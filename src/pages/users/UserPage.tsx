import React, { useState, useEffect, useCallback, useMemo } from 'react'; // 1. Add useMemo
import { useParams, useSearchParams } from 'react-router-dom';
import { CircularProgress, Button } from '@mui/joy';
import { DeleteForever } from '@mui/icons-material';
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
          setBrands(brandsResponse.data.data.brands);
        }
      } else {
        setHasAccess(false);
        setBrands([]);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setHasAccess(false);
        setBrands([]);
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

  // --- EVENT HANDLERS (MEMOIZED) ---
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
          count: (d.dashboard_id === activeDashboard) ? brands.length : undefined
        })),
        activeTab: activeDashboard,
        onTabChange: handleDashboardChange,
      });
    }
    return () => {
      setTabInfo(null);
    };
  }, [setTabInfo, dashboards, activeDashboard, brands.length, handleDashboardChange]);
  
  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  useEffect(() => {
    if (activeDashboard) {
      fetchUserBrands();
    }
  }, [activeDashboard, fetchUserBrands]);

  const activeDashboardData = dashboards.find(d => d.dashboard_id === activeDashboard);

  // --- 2. THIS IS THE FIX ---
  // We use useMemo to create a stable array. It will only update
  // when selectedBrandForEdit (the object) changes.
  const memoizedAssignedPlatformIds = useMemo(() => {
    // Return an array of platform IDs, or undefined if no brand is selected
    return selectedBrandForEdit?.platforms.map(p => p.platform_id);
  }, [selectedBrandForEdit]); // Dependency is the brand object

  // --- RENDER ---
  const pageContent = () => {
    if (isLoadingDashboards) {
      return (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress sx={{ color: TEXT_PRIMARY.PURPLE }} />
        </div>
      );
    }
    
    if (!hasAccess && !isLoadingBrands) {
      return (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '24px', padding: '24px', height: '100%' }}>
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
      );
    }

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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FAFAFA', position: 'relative' }}>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: TEXT_PRIMARY.GREY }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <h3>User Access tree Coming Soon</h3>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: '24px', right: '24px' }}>
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

    return (
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress sx={{ color: TEXT_PRIMARY.PURPLE }} />
      </div>
    );
  };
  
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {pageContent()}

      <BrandModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        dashboardName={activeDashboardData?.dashboard_type || ''}
        dashboardId={activeDashboard}
        userId={userId || ''}
        selectedBrandId={selectedBrandForEdit?.brand_id}
        selectedBrandName={selectedBrandForEdit?.brand_name}
        // 3. Pass the new memoized array to the modal
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