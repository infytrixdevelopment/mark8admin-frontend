import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, CircularProgress, Button, Stack, Select, Option, Tooltip } from '@mui/joy';
import { Search, Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import toast from 'react-hot-toast';
import { TEXT_PRIMARY } from '../../constants/textColorsConstants';
import Input from '../../components/appComponents/inputs/Input';
import CreateMappingModal from './CreateMappingModal';
import { useAdminLayout } from '../users/AdminLayout';
import PaginationComponent from '../../components/appComponents/PaginationComponent';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const getToken = () => localStorage.getItem('token');

type App = {
    app_id: string;
    app_name: string;
};
type PlatformInfo = {
    platform_id: string;
    platform_name: string;
    has_dashboard: boolean;
    dashboard_name: string | null;
};
type MappedBrand = {
    brand_id: string;
    brand_name: string;
    company_name: string;
    platforms: PlatformInfo[] | null;
};

const BrandManagementPage: React.FC = () => {
    const { setAppTabInfo } = useAdminLayout();

    const [apps, setApps] = useState<App[]>([]);
    const [activeAppId, setActiveAppId] = useState<string>('');
    const [isLoadingApps, setIsLoadingApps] = useState(true);

    const [mappedBrands, setMappedBrands] = useState<MappedBrand[]>([]);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);

    // --- 1. Add state to store counts (like UserPage) ---
    const [brandCounts, setBrandCounts] = useState<Record<string, number>>({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedBrandToEdit, setSelectedBrandToEdit] = useState<MappedBrand | null>(null);

    // Search State
    const [searchInput, setSearchInput] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);

    // Fetch all apps (for tabs)
    const fetchApps = useCallback(async () => {
        setIsLoadingApps(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/apps`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            if (response.data.success && response.data.data.apps.length > 0) {
                setApps(response.data.data.apps);
                setActiveAppId(response.data.data.apps[0].app_id);
            }
        } catch (err) {
            toast.error('Failed to fetch apps');
        } finally {
            setIsLoadingApps(false);
        }
    }, []);

    // Fetch mapped brands for the active app
    const fetchMappedBrands = useCallback(async () => {
        if (!activeAppId) return;
        setIsLoadingBrands(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/brand-mappings`, {
                headers: { Authorization: `Bearer ${getToken()}` },
                params: { appId: activeAppId }
            });
            if (response.data.success) {
                const fetchedBrands = response.data.data;
                setMappedBrands(fetchedBrands);
                // --- 2. Save the count to the state ---
                setBrandCounts(prev => ({ ...prev, [activeAppId]: fetchedBrands.length }));
            } else {
                setMappedBrands([]);
                setBrandCounts(prev => ({ ...prev, [activeAppId]: 0 }));
            }
        } catch (err) {
            toast.error('Failed to fetch mapped brands');
            setMappedBrands([]);
            // --- 3. Save count as 0 on error ---
            setBrandCounts(prev => ({ ...prev, [activeAppId]: 0 }));
        } finally {
            setIsLoadingBrands(false);
        }
    }, [activeAppId]); // Dependency is correct

    // Initial data load
    useEffect(() => {
        fetchApps();
    }, [fetchApps]);

    // Re-fetch brands when active app changes
    useEffect(() => {
        fetchMappedBrands();
    }, [fetchMappedBrands]);

    const handleTabChange = useCallback((appId: string) => {
        setActiveAppId(appId);
    }, []);

    // Sync with AdminLayout
    useEffect(() => {
        if (apps.length > 0) {
            setAppTabInfo({
                tabs: apps.map(app => ({
                    id: app.app_id,
                    name: app.app_name,
                    // --- 4. Read from the state ---
                    count: brandCounts[app.app_id]
                })),
                activeTab: activeAppId,
                onTabChange: handleTabChange,
            });
        } else {
            setAppTabInfo(null);
        }

        return () => {
            setAppTabInfo(null);
        };
        // --- 5. Update dependency array ---
    }, [setAppTabInfo, apps, activeAppId, brandCounts, handleTabChange]);


    const handleOpenCreateModal = () => {
        setModalMode('create');
        setSelectedBrandToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (brand: MappedBrand) => {
        setModalMode('edit');
        setSelectedBrandToEdit(brand);
        setIsModalOpen(true);
    };

    const handleDeleteMapping = async (brand: MappedBrand) => {
        if (!window.confirm(`Are you sure you want to delete all mappings for "${brand.brand_name}" in this app? This will also remove access for all users.`)) {
            return;
        }
        try {
            await axios.delete(`${API_BASE_URL}/api/admin/brand-mappings/${activeAppId}/${brand.brand_id}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            toast.success('Brand mapping deleted successfully');
            fetchMappedBrands(); // Refresh the list (which will update the count)
        } catch (err) {
            toast.error('Failed to delete mapping');
        }
    };

    // Handle Search
    const handleSearch = () => {
        setPage(1);
        setSearchQuery(searchInput);
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchQuery('');
        setPage(1);
    };

    // Filtered Brands
    const filteredBrands = useMemo(() => {
        if (!searchQuery) {
            return mappedBrands;
        }
        return mappedBrands.filter(brand =>
            brand.brand_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [mappedBrands, searchQuery]);

    // Paginated Brands
    const paginatedBrands = useMemo(() => {
        return filteredBrands.slice((page - 1) * limit, page * limit);
    }, [filteredBrands, page, limit]);

    // Page Reset Effect
    useEffect(() => {
        setPage(1);
    }, [searchQuery, activeAppId, limit]);


    const activeAppData = apps.find(app => app.app_id === activeAppId);

    return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

      <Box sx={{ flex: 1, backgroundColor: '#F9FAFB', overflowY: 'auto' }}>
        
        {isLoadingApps && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
        )}

        {!isLoadingApps && activeAppId && (
          <>
            {/* Search Bar (no change) */}
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center" 
              sx={{ 
                mb: 2, 
                padding: '24px 24px 16px 24px'
              }}
            >
              <Stack direction="row" spacing={1} sx={{ width: '400px', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <Input
                    placeholder="Search by brand name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    disabled={isLoadingBrands}
                  />
                  {searchInput && (
                    <span
                      onClick={handleClearSearch}
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#8E59FF',
                        fontWeight: 700,
                        fontSize: 18,
                        zIndex: 2
                      }}
                      title="Clear"
                    >
                      ×
                    </span>
                  )}
                </div>
                <Button
                  startDecorator={<Search />}
                  sx={{ backgroundColor: TEXT_PRIMARY.PURPLE }}
                  onClick={handleSearch}
                  disabled={isLoadingBrands}
                  loading={isLoadingBrands && searchQuery.length > 0}
                >
                  Search
                </Button>
              </Stack>
              <Button
                startDecorator={<Add />}
                sx={{ backgroundColor: TEXT_PRIMARY.PURPLE }}
                onClick={handleOpenCreateModal}
                disabled={isLoadingBrands}
              >
                Create Brand Mapping
              </Button>
            </Stack>

            {/* Table Container (no change) */}
            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '8px',
              boxShadow: '0 4px 16px 6px rgba(130, 130, 130, 0.05)',
              border: '1px solid #ECF0FF',
              mx: '24px' 
            }}>
              
              {/* Table Header (no change) */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                height: 48,
                fontSize: 12,
                fontWeight: 700,
                backgroundColor: '#EAE4F8',
                color: '#1C1C1C',
              }}>
                <div style={{ width: '25%', padding: '16px', borderRight: '1px solid #ECF0FF' }}>Brand Name</div>
                <div style={{ width: '25%', padding: '16px', borderRight: '1px solid #ECF0FF' }}>Company Name</div>
                <div style={{ width: '40%', padding: '16px', borderRight: '1px solid #ECF0FF' }}>Platforms</div>
                <div style={{ width: '10%', padding: '16px', textAlign: 'center' }}>Actions</div>
              </Box>
              
              {/* --- TABLE BODY --- */}
              <Box sx={{
                position: 'relative',
                // --- UPDATED HEIGHT ---
                // 100vh - 100px (Header+Tabs) - 80px (Search Bar) - 48px (Table Header) - 60px (Footer) - 24px (Bottom Space)
                height: 'calc(100vh - 100px - 80px - 48px - 60px - 24px)',
                overflowY: 'auto',
                backgroundColor: TEXT_PRIMARY.WHITE
              }}>
                {/* Loading/No Users (no change) */}
                {(isLoadingBrands) && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    zIndex: 1
                  }}>
                    <CircularProgress color="primary" sx={{ color: '#8E59FF' }} />
                  </div>
                )}
                {!isLoadingBrands && filteredBrands.length === 0 && (
                  <div style={{ padding: 16, textAlign: 'center', marginTop: '20px', color: TEXT_PRIMARY.GREY }}>
                    {searchQuery ? `No brand mappings found for "${searchQuery}".` : 'No brand mappings found for this app.'}
                  </div>
                )}
                
                {/* Render paginatedBrands (no change) */}
                {!isLoadingBrands && paginatedBrands.length > 0 && (
                  paginatedBrands.map((brand) => (
                    <div 
                      key={brand.brand_id} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        minHeight: 44,
                        borderBottom: '1px solid #ECF0FF',
                      }}
                    >
                      {/* Brand Name Cell */}
                      <div style={{
                        width: '25%',
                        padding: '12px 16px',
                        borderRight: '1px solid #ECF0FF',
                        color: TEXT_PRIMARY.PURPLE,
                        fontSize: 12,
                        wordBreak: 'break-word',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                        onClick={() => handleOpenEditModal(brand)}
                      >
                        {brand.brand_name}
                      </div>
                      
                      {/* Company Name Cell */}
                      <div style={{
                        width: '25%',
                        padding: '12px 16px',
                        borderRight: '1px solid #ECF0FF',
                        color: '#1C1C1C',
                        fontSize: 12,
                        wordBreak: 'break-word'
                      }}>
                        {brand.company_name || 'N/A'}
                      </div>

                      {/* Platform Cell (with pills) */}
                      <div style={{
                        width: '40%',
                        padding: '12px 16px',
                        borderRight: '1px solid #ECF0FF',
                        color: '#656981',
                        fontSize: 12,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        alignItems: 'center'
                      }}>
                        {!brand.platforms || brand.platforms.length === 0 ? (
                          <span style={{ fontSize: 12, color: '#656981' }}>
                            No platforms mapped
                          </span>
                        ) : (
                          brand.platforms.map((platform) => (
                            <Box
                              key={platform.platform_id}
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 10px', 
                                backgroundColor: '#F4F6F8', // Light grey pill
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: TEXT_PRIMARY.BLACK,
                              }}
                            >
                              {platform.platform_name}
                              {platform.has_dashboard && (
                                <Tooltip
                                  title={platform.dashboard_name || 'Dashboard'}
                                  variant="outlined"
                                  size="sm"
                                  arrow
                                >
                                  <Box
                                    component="span"
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: '2px 6px',
                                      backgroundColor: '#E5DBFF', // Theme-purple light
                                      borderRadius: '10px',
                                      fontSize: '10px', 
                                      color: TEXT_PRIMARY.PURPLE,
                                      marginLeft: '6px',
                                      cursor: 'default' 
                                    }}
                                  >
                                    📊
                                  </Box>
                                </Tooltip>
                              )}
                            </Box>
                          ))
                        )}
                      </div>
                      
                      {/* Actions Cell */}
                      <div style={{
                        width: '10%',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        <Button 
                          variant="soft" 
                          color="danger" 
                          size="sm"
                          onClick={() => handleDeleteMapping(brand)}
                        >
                          <Delete />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </Box>

              {/* Pagination Footer (no change) */}
              <div style={{
                borderTop: '1px solid #ECF0FF',
                height: 60,
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0px 24px',
                width: '100%',
                backgroundColor: TEXT_PRIMARY.WHITE
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 400,
                    marginRight: '8px',
                    color: TEXT_PRIMARY.GREY
                  }}>
                    Rows per page:
                  </div>
                  <Select
                    onChange={(_, limit) => setLimit(limit ? limit : 10)}
                    value={limit}
                    sx={{
                      width: '80px',
                      height: '28px',
                      fontSize: 14,
                      border: '1px solid #ECF0FF',
                      backgroundColor: TEXT_PRIMARY.WHITE,
                    }}
                    disabled={isLoadingBrands}
                  >
                    <Option value={10}>10</Option>
                    <Option value={20}>20</Option>
                    <Option value={50}>50</Option>
                  </Select>
                </div>
                {filteredBrands.length > 0 && (
                  <PaginationComponent
                    page={page}
                    limit={limit}
                    totalRows={filteredBrands.length} 
                    onChange={(p) => setPage(p)}
                  />
                )}
                {filteredBrands.length === 0 && <div style={{ minWidth: '200px' }}></div>}
              </div>

            </Box>
            
            <div style={{ height: 24 }} />
          </>
        )}
      </Box>

      {/* Modal (no change) */}
      {isModalOpen && (
        <CreateMappingModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          mode={modalMode}
          appId={activeAppId}
          appName={activeAppData?.app_name || ''}
          editBrand={selectedBrandToEdit}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchMappedBrands(); // Refresh the list
          }}
        />
      )}
    </Box>
  );
};

export default BrandManagementPage;