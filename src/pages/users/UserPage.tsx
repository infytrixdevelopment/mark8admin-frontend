import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CircularProgress, Button, Box, Typography } from '@mui/joy';
import { DeleteForever, Person, Email, Business, Badge } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import BrandSidebar from '../../components/appComponents/BrandSidebar';
import BrandModal from './BrandModal';
import { TEXT_PRIMARY } from '../../constants/textColorsConstants';
import { useAdminLayout } from './AdminLayout';
import AccessTree from '../../components/AccessTree'; // Import the new component
import { BASE_URL } from '../../constants/appConstants';


// --- TYPE DEFINITIONS ---
type App = {
  app_id: string;
  app_name: string;
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
type User = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  user_type: string;
  organisation: string;
};
type AccessTreeApp = {
  app_id: string;
  app_name: string;
  brands: AccessTreeBrand[];
};
type AccessTreeBrand = {
  brand_id: string;
  brand_name: string;
  platforms: AccessTreePlatform[];
};
type AccessTreePlatform = {
  platform_id: string;
  platform_name: string;
};


// --- COMPONENT ---
const UserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setAppTabInfo } = useAdminLayout();

  // --- STATES ---
  const [apps, setApps] = useState<App[]>([]);
  const [activeAppId, setActiveAppId] = useState<string>('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});
  const [accessTree, setAccessTree] = useState<AccessTreeApp[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedBrandForEdit, setSelectedBrandForEdit] = useState<Brand | null>(null);
  const [availableBrands, setAvailableBrands] = useState<AvailableBrand[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<Platform[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isLoadingAvailableBrands, setIsLoadingAvailableBrands] = useState(false);
  const [isLoadingPlatforms, setIsLoadingPlatforms] = useState(false);
  const [isDeletingApp, setIsDeletingApp] = useState(false);
  const [isLoadingTree, setIsLoadingTree] = useState(false);

  const getToken = () => localStorage.getItem('token');

  // --- API FUNCTIONS (MEMOIZED) ---
  
  // fetchAccessTree function with the fix
  const fetchAccessTree = useCallback(async () => {
    if (!userId) return;
    setIsLoadingTree(true);
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}api/admin/users/${userId}/access-tree`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAccessTree(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching access tree:', error);
      toast.error('Failed to load access tree');
    } finally {
      setIsLoadingTree(false); // <-- THIS IS THE FIX
    }
  }, [userId]);
  
  // (All other functions are the same as before)
  const fetchUserInfo = useCallback(async () => {
    if (!userId) return;
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}api/admin/users/${userId}`, {
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

  const fetchApps = useCallback(async () => {
    setIsLoadingApps(true);
    try {
      const token = getToken();
      const response = await axios.get(`${BASE_URL}api/admin/apps`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const appList = response.data.data.apps;
        setApps(appList);
        const appParam = searchParams.get('app');
        if (appParam && appList.some((app: App) => app.app_id === appParam)) {
          setActiveAppId(appParam);
        } else if (appList.length > 0) {
          const firstAppId = appList[0].app_id;
          setActiveAppId(firstAppId);
          if (appParam !== firstAppId) {
            setSearchParams({ app: firstAppId }, { replace: true });
          }
        }
      }
    } catch (error: any) { toast.error('Failed to load apps');
    } finally { setIsLoadingApps(false); }
  }, [searchParams, setSearchParams]);

  const fetchUserBrands = useCallback(async () => {
    if (!userId || !activeAppId) return;
    setIsLoadingBrands(true);
    setHasAccess(false);
    try {
      const token = getToken();
      const accessResponse = await axios.get(
        `${BASE_URL}api/admin/users/${userId}/apps/${activeAppId}/access`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (accessResponse.data.success && accessResponse.data.data.hasAccess) {
        setHasAccess(true);
        const brandsResponse = await axios.get(
          `${BASE_URL}api/admin/users/${userId}/apps/${activeAppId}/brands`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (brandsResponse.data.success) {
          const fetchedBrands = brandsResponse.data.data.brands;
          setBrands(fetchedBrands);
          setBrandCounts(prev => ({ ...prev, [activeAppId]: fetchedBrands.length }));
        }
      } else {
        setHasAccess(false);
        setBrands([]);
        setBrandCounts(prev => ({ ...prev, [activeAppId]: 0 }));
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setHasAccess(false);
        setBrands([]);
        setBrandCounts(prev => ({ ...prev, [activeAppId]: 0 }));
      }
    } finally {
      setIsLoadingBrands(false);
    }
  }, [userId, activeAppId]);

  const fetchBrandPlatforms = useCallback(async (brandId: string) => {
    setIsLoadingPlatforms(true);
    try {
      const token = getToken();
      const response = await axios.get(
        `${BASE_URL}api/admin/brands/${brandId}/platforms`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: { appId: activeAppId }
        }
      );
      if (response.data.success) {
        setAvailablePlatforms(response.data.data.platforms);
      }
    } catch (error) { toast.error('Failed to load platforms');
    } finally { setIsLoadingPlatforms(false); }
  }, [activeAppId]);

  const handleBrandModalSubmit = useCallback(async (brandId: string, platformIds: string[]) => {
    try {
      const token = getToken();
      let endpoint, method;
      if (!hasAccess && modalMode === 'add') {
        endpoint = `${BASE_URL}api/admin/users/${userId}/apps/${activeAppId}/grant-access`;
        method = 'post';
      } else if (modalMode === 'add') {
        endpoint = `${BASE_URL}api/admin/users/${userId}/apps/${activeAppId}/brands`;
        method = 'post';
      } else {
        endpoint = `${BASE_URL}api/admin/users/${userId}/apps/${activeAppId}/brands/${brandId}/platforms`;
        method = 'put';
      }
      const payload = modalMode === 'add' ? { brandId, platformIds } : { platformIds };
      const methodKey = method as keyof typeof axios;
      const response = await (axios[methodKey] as any)(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.data.success) {
        fetchUserBrands();
        fetchAccessTree();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save brand');
      throw error;
    }
  }, [hasAccess, modalMode, userId, activeAppId, fetchUserBrands, fetchAccessTree]);

  const handleAppChange = useCallback((appId: string) => {
    setActiveAppId(appId);
    setSearchParams({ app: appId }, { replace: true });
  }, [setSearchParams]);

  const fetchAvailableBrands = useCallback(async () => {
    if (!userId || !activeAppId) return;
    setIsLoadingAvailableBrands(true);
    try {
      const token = getToken();
      const response = await axios.get(
        `${BASE_URL}api/admin/brands/available`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { userId, appId: activeAppId }
        }
      );
      if (response.data.success) {
        setAvailableBrands(response.data.data.brands);
      }
    } catch (error) { toast.error('Failed to load available brands');
    } finally { setIsLoadingAvailableBrands(false); }
  }, [userId, activeAppId]);
  
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

const handleEditBrand = useCallback((brandId: string) => {
     const brand = brands.find(b => b.brand_id === brandId);
     if (!brand) return;
     
     setModalMode('edit');
     setSelectedBrandForEdit(brand);
     setIsModalOpen(true); //Open modal IMMEDIATELY
     
     // Fetch platforms in background AFTER modal opens
     fetchBrandPlatforms(brandId);
   }, [brands, fetchBrandPlatforms]);

  const handleDeleteAppAccess = useCallback(async (skipConfirmation = false) => {
    const appName = apps.find(d => d.app_id === activeAppId)?.app_name;
    
    if (!skipConfirmation && !window.confirm(`Are you sure you want to revoke access to ${appName} app? This will remove all brands and platforms.`)) {
      return;
    }

    setIsDeletingApp(true);
    try {
      const token = getToken();
      const response = await axios.delete(
        `${BASE_URL}api/admin/users/${userId}/apps/${activeAppId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        if (!skipConfirmation) {
          toast.success('App access revoked successfully');
        }
        fetchUserBrands();
        fetchAccessTree();
      }
    } catch (error: any) { 
      toast.error('Failed to revoke access');
    } finally { 
      setIsDeletingApp(false); 
    }
  }, [userId, activeAppId, apps, fetchUserBrands, fetchAccessTree]);

  const handleDeleteMultipleBrands = useCallback(async (brandIds: string[]) => {
    const totalBrandsBeforeDelete = brands.length;
    const brandsToDeleteCount = brandIds.length;

    if (brandsToDeleteCount === totalBrandsBeforeDelete && brandsToDeleteCount > 0) {
      const appName = apps.find(d => d.app_id === activeAppId)?.app_name;
      if (window.confirm(`This will remove all ${brandsToDeleteCount} brands and revoke access to the ${appName} app. Are you sure?`)) {
        toast.success('All brands removed. Revoking app access...');
        handleDeleteAppAccess(true);
      }
      return;
    }

    if (!window.confirm(`Are you sure you want to remove ${brandIds.length} brand(s)?`)) return;

    const token = getToken();
    const deletePromises = brandIds.map(brandId => {
      return axios.delete(
        `${BASE_URL}api/admin/users/${userId}/apps/${activeAppId}/brands/${brandId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    });

    try {
      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        toast.success(`${successful} brand(s) removed successfully`);
      }
      if (failed > 0) {
        toast.error(`${failed} brand(s) could not be removed`);
      }
      
      fetchUserBrands();
      fetchAccessTree();
    } catch (error) {
      console.error('Error during bulk delete:', error);
      toast.error('An error occurred while removing brands');
    }
  }, [userId, activeAppId, fetchUserBrands, brands.length, handleDeleteAppAccess, apps, fetchAccessTree]);

  // --- EFFECTS ---
  useEffect(() => {
    if (apps.length > 0) {
      setAppTabInfo({
        tabs: apps.map(app => ({
          id: app.app_id,
          name: app.app_name,
          count: brandCounts[app.app_id]
        })),
        activeTab: activeAppId,
        onTabChange: handleAppChange,
      });
    }
    return () => {
      setAppTabInfo(null);
    };
  }, [setAppTabInfo, apps, activeAppId, brandCounts, handleAppChange]);
  
  useEffect(() => {
    fetchApps();
    fetchUserInfo();
    fetchAccessTree();
  }, [fetchApps, fetchUserInfo, fetchAccessTree]);

  useEffect(() => {
    if (activeAppId) {
      fetchUserBrands();
    }
  }, [activeAppId, fetchUserBrands]);

  const activeAppData = apps.find(d => d.app_id === activeAppId);

  const memoizedAssignedPlatformIds = useMemo(() => {
    return selectedBrandForEdit?.platforms.map(p => p.platform_id);
  }, [selectedBrandForEdit]);

  // (UserInfoBar component is the same)
  const UserInfoBar = () => (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        p: 2,
        backgroundColor: '#FFFFFF',
        border: '1px solid #ECF0FF',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        mb: 2,
      }}
    >
      {userInfo ? (
        <>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography level="body-xs" sx={{ color: TEXT_PRIMARY.GREY }}>User Name</Typography>
            <Typography level="title-sm" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Person sx={{ fontSize: '18px', color: TEXT_PRIMARY.PURPLE }} />
              {userInfo.first_name} {userInfo.last_name}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography level="body-xs" sx={{ color: TEXT_PRIMARY.GREY }}>Email</Typography>
            <Typography level="title-sm" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, wordBreak: 'break-all' }}>
              <Email sx={{ fontSize: '18px', color: TEXT_PRIMARY.PURPLE }} />
              {userInfo.email}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Typography level="body-xs" sx={{ color: TEXT_PRIMARY.GREY }}>User Type</Typography>
            <Typography level="title-sm" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
              <Badge sx={{ fontSize: '18px', color: TEXT_PRIMARY.PURPLE }} />
              {userInfo.user_type}
            </Typography>
          </Box>
          <Box sx={{ flex: '1 1 150px', minWidth: '150px' }}>
            <Typography level="body-xs" sx={{ color: TEXT_PRIMARY.GREY }}>Organisation</Typography>
            <Typography level="title-sm" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Business sx={{ fontSize: '18px', color: TEXT_PRIMARY.PURPLE }} />
              {userInfo.organisation}
            </Typography>
          </Box>
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
    if (isLoadingApps) {
      return (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress sx={{ color: TEXT_PRIMARY.PURPLE }} />
        </div>
      );
    }
    
    if (!hasAccess && !isLoadingBrands) {
      return (
        <Box sx={{ p: 2, backgroundColor: '#F9FAFB' }}>
          <UserInfoBar />
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '24px', padding: '24px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #ECF0FF' }}>
            <div style={{ fontSize: '64px' }}>🔒</div>
            <h2 style={{ color: TEXT_PRIMARY.BLACK, margin: 0 }}>No Access</h2>
            <p style={{ color: TEXT_PRIMARY.GREY, margin: 0, textAlign: 'center' }}>
              User doesn't have access to <strong>{activeAppData?.app_name}</strong> app
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

    if (hasAccess || isLoadingBrands) {
      return (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', height: '100%' }}>
          <BrandSidebar
            brands={brands}
            isLoading={isLoadingBrands}
            onAddBrand={handleAddBrand}
            onEditBrand={handleEditBrand}
            onDeleteMultipleBrands={handleDeleteMultipleBrands}
            appName={activeAppData?.app_name || ''}
          />
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FAFAFB',
            position: 'relative',
            overflow: 'auto',
            padding: '16px'
          }}>
            
            <UserInfoBar />
            
            <Box sx={{
              flex: 1,
              display:'flex',
              flexDirection:'column',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #ECF0FF',
              minHeight: '300px',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid #ECF0FF', 
                backgroundColor: '#F9F9F9' 
              }}>
                <Typography level="title-md">Total Access Tree</Typography>
              </Box>
              <Box sx={{ overflow: 'auto' }}>
                <AccessTree data={accessTree} isLoading={isLoadingTree} />
              </Box>
            </Box>

            <div style={{
              position: 'sticky',
              bottom: '2px',
              marginTop: '16px',
              alignSelf: 'flex-end'
            }}>
              <Button
              
                variant="solid"
                color="danger"
                startDecorator={<DeleteForever />}
                onClick={() => handleDeleteAppAccess(false)}
                loading={isDeletingApp}
                disabled={isDeletingApp}
                sx={{ backgroundColor: '#D32F2F', ':hover': { backgroundColor: '#B71C1C' }}}
              >
                Revoke {activeAppData?.app_name} Access
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
      
      <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: '#F9FAFB' }}>
        {pageContent()}
      </Box>

      <BrandModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        appName={activeAppData?.app_name || ''}
        appId={activeAppId}
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