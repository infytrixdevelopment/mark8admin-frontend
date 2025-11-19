import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Modal, ModalDialog, DialogTitle, DialogContent, Stack, FormControl, FormLabel, Select,
  Option, Button, Checkbox, CircularProgress, Box, IconButton
} from '@mui/joy';
import { Add, Delete } from '@mui/icons-material';
import { TEXT_PRIMARY } from '../../constants/textColorsConstants';
import toast from 'react-hot-toast';
import axios from 'axios';
import AddDashboardModal from './AddDashboardModal'; 
import {BASE_URL} from "../../constants/appConstants"


const getToken = () => localStorage.getItem('token');

type AppPlatform = {
  platform_id: string;
  platform_name: string;
};

type AppBrand = {
  brand_id: string;
  brand_name: string;
};

type PlatformInfo = {
  platform_id: string;
  platform_name: string;
  has_dashboard: boolean;
};

type MappedBrand = {
  brand_id: string;
  brand_name: string;
  company_name: string;
  platforms: PlatformInfo[] | null; 
};

type PbiDashboardData = {
  platformId: string;
  masterDashboardId: string;
  dashboardType: string; // The name
  workspaceId: string;
  reportId: string;
  datasetId: string;
  url: string; 
};

type CreateMappingModalProps = {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  appId: string;
  appName: string;
  editBrand: MappedBrand | null;
  onSuccess: () => void;
};

const CreateMappingModal: React.FC<CreateMappingModalProps> = ({
  open, onClose, mode, appId, appName, editBrand, onSuccess
}) => {
  // Data fetching
  const [unmappedBrands, setUnmappedBrands] = useState<AppBrand[]>([]);
  const [allPlatforms, setAllPlatforms] = useState<AppPlatform[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedPlatformIds, setSelectedPlatformIds] = useState<Set<string>>(new Set());
  
  const [initialPlatformIds, setInitialPlatformIds] = useState<Set<string>>(new Set());
  
  // State for sub-modal
  const [isPbiModalOpen, setIsPbiModalOpen] = useState(false);
  const [pbiModalPlatform, setPbiModalPlatform] = useState<AppPlatform | null>(null);

  const [attachedDashboards, setAttachedDashboards] = useState<Map<string, PbiDashboardData>>(new Map());

  // (All hooks and handlers remain the same)
  // ... (fetchModalData, useEffect, sortedPlatforms, selectedBrandName) ...
  // ... (handleTogglePlatform, handleSelectAll, handleOpenPbiModal) ...
  // ... (handleSavePbiDashboard, handleRemovePbiDashboard, handleSubmit) ...

  const fetchModalData = useCallback(async () => {
    setIsLoading(true);
    setInitialPlatformIds(new Set());
    try {
      const platformsPromise = axios.get(`${BASE_URL}/api/admin/brand-mappings/platforms`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      if (mode === 'create') {
        const unmappedBrandsPromise = axios.get(`${BASE_URL}/api/admin/brand-mappings/unmapped`, {
          headers: { Authorization: `Bearer ${getToken()}` },
          params: { appId }
        });
        const [platformsRes, unmappedBrandsRes] = await Promise.all([platformsPromise, unmappedBrandsPromise]);
        setAllPlatforms(platformsRes.data.data);
        setUnmappedBrands(unmappedBrandsRes.data.data);
      } else if (mode === 'edit' && editBrand) {
        setSelectedBrandId(editBrand.brand_id);
        const detailsPromise = axios.get(`${BASE_URL}/api/admin/brand-mappings/${appId}/${editBrand.brand_id}`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const [platformsRes, detailsRes] = await Promise.all([platformsPromise, detailsPromise]);
        
        setAllPlatforms(platformsRes.data.data);
        setUnmappedBrands([{ brand_id: editBrand.brand_id, brand_name: editBrand.brand_name }]);
        
        const initialIds = new Set<string>(detailsRes.data.data.platform_ids);
        setSelectedPlatformIds(initialIds);
        setInitialPlatformIds(initialIds); 
        
        const newDashMap = new Map<string, PbiDashboardData>();
        detailsRes.data.data.dashboards.forEach((dash: any) => {
          newDashMap.set(dash.platform_id, {
            platformId: dash.platform_id,
            masterDashboardId: dash.master_power_bi_dashboard_type_id,
            dashboardType: dash.dashboard_type,
            url: dash.url,
            workspaceId: dash.workspace_id,
            reportId: dash.report_id,
            datasetId: dash.dataset_id,
          });
        });
        setAttachedDashboards(newDashMap);
      }
    } catch (err) {
      toast.error('Failed to load data for modal');
    } finally {
      setIsLoading(false);
    }
  }, [appId, mode, editBrand]);

  useEffect(() => {
    if (open) {
      fetchModalData();
    }
  }, [open, fetchModalData]);

  const sortedPlatforms = useMemo(() => {
    if (!allPlatforms) {
      return [];
    }
    const platformsToSort = [...allPlatforms];

    if (mode === 'create') {
      return platformsToSort.sort((a, b) => a.platform_name.localeCompare(b.platform_name));
    }

    return platformsToSort.sort((a, b) => {
      const isASelected = initialPlatformIds.has(a.platform_id); 
      const isBSelected = initialPlatformIds.has(b.platform_id); 

      if (isASelected && !isBSelected) {
        return -1; 
      }
      if (!isASelected && isBSelected) {
        return 1;
      }
      
      return a.platform_name.localeCompare(b.platform_name);
    });
  }, [allPlatforms, initialPlatformIds, mode]);

  const selectedBrandName = useMemo(() => {
    if (mode === 'edit' && editBrand) {
      return editBrand.brand_name;
    }
    const brand = unmappedBrands.find(b => b.brand_id === selectedBrandId);
    return brand ? brand.brand_name : '';
  }, [selectedBrandId, unmappedBrands, mode, editBrand]);


  const handleTogglePlatform = (platformId: string) => {
    const newSelected = new Set(selectedPlatformIds);
    if (newSelected.has(platformId)) {
      newSelected.delete(platformId);
      const newDashMap = new Map(attachedDashboards);
      newDashMap.delete(platformId);
      setAttachedDashboards(newDashMap);
    } else {
      newSelected.add(platformId);
    }
    setSelectedPlatformIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedPlatformIds.size === allPlatforms.length) {
      setSelectedPlatformIds(new Set());
      setAttachedDashboards(new Map());
    } else {
      setSelectedPlatformIds(new Set(allPlatforms.map(p => p.platform_id)));
    }
  };
  
  const handleOpenPbiModal = (platform: AppPlatform) => {
    setPbiModalPlatform(platform);
    setIsPbiModalOpen(true);
  };
  
  const handleSavePbiDashboard = (pbiData: Omit<PbiDashboardData, 'platformId'>) => {
    if (!pbiModalPlatform) return;
    const newDashMap = new Map(attachedDashboards);
    newDashMap.set(pbiModalPlatform.platform_id, {
      ...pbiData,
      platformId: pbiModalPlatform.platform_id
    });
    setAttachedDashboards(newDashMap);
    setIsPbiModalOpen(false);
    setPbiModalPlatform(null);
  };
  
  const handleRemovePbiDashboard = (platformId: string) => {
    if (!window.confirm('Are you sure you want to remove this dashboard?')) return;
    const newDashMap = new Map(attachedDashboards);
    newDashMap.delete(platformId);
    setAttachedDashboards(newDashMap);
  };

  const handleSubmit = async () => {
    if (!selectedBrandId) {
      toast.error('Please select a brand');
      return;
    }
    if (selectedPlatformIds.size === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    const payload = {
      appId,
      brandId: selectedBrandId,
      platformIds: Array.from(selectedPlatformIds),
      dashboards: Array.from(attachedDashboards.values())
    };

    setIsLoading(true);
    try {
      if (mode === 'create') {
        await axios.post(`${BASE_URL}/api/admin/brand-mappings`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        toast.success(`Brand mapping created successfully`);

      } else {
        await axios.put(`${BASE_URL}/api/admin/brand-mappings/${appId}/${selectedBrandId}`, payload, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        toast.success(`Brand mapping updated successfully`);
      }
      
      onSuccess(); 
      
    } catch (err: any) {
      console.error('Error saving mapping:', err);
      toast.error(err.response?.data?.message || 'Failed to save mapping');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog sx={{ width: 600, maxHeight: '90vh', overflow: 'auto' }}>
          <DialogTitle>
            {mode === 'create' 
              ? `Create Brand Mapping in ${appName}` 
              : `Edit Mapping for ${editBrand?.brand_name || ''} in ${appName}`
            }
          </DialogTitle>
          
          <DialogContent>
            {mode === 'create'
              ? 'Select a brand and the platforms you want to map to this app.'
              : 'Edit platforms and their associated dashboards'
            }
          </DialogContent>

          <Stack spacing={2} sx={{ mt: 2 }}>
            {isLoading ? <CircularProgress sx={{ m: 'auto' }} /> : (
              <>
                {/* Select Brand */}
                <FormControl>
                  <FormLabel>Select Brand:</FormLabel>
                  <Select
                    value={selectedBrandId}
                    onChange={(_, val) => setSelectedBrandId(val as string)}
                    disabled={mode === 'edit'}
                    placeholder="Choose a brand"
                  >
                    {unmappedBrands.map(brand => (
                      <Option key={brand.brand_id} value={brand.brand_id}>{brand.brand_name}</Option>
                    ))}
                  </Select>
                </FormControl>

                {/* Select Platforms */}
                <FormControl>
                  <FormLabel>Select Platforms:</FormLabel>
                  <Box sx={{ border: '1px solid #E0E0E0', borderRadius: '6px' }}>
                    <Box sx={{ p: 1.5, borderBottom: '1px solid #E0E0E0', backgroundColor: '#F9F9F9' }}>
                      <Checkbox
                        label={`Select All (${allPlatforms.length})`}
                        checked={selectedPlatformIds.size === allPlatforms.length}
                        onChange={handleSelectAll}
                      />
                    </Box>
                    <Stack sx={{ p: 1, maxHeight: '300px', overflowY: 'auto' }}>
                      {sortedPlatforms.map(platform => {
                        const isChecked = selectedPlatformIds.has(platform.platform_id);
                        const hasDashboard = attachedDashboards.has(platform.platform_id);
                        const dashboardData = attachedDashboards.get(platform.platform_id);
                        
                        return (
                          <Box key={platform.platform_id} sx={{ display: 'flex', alignItems: 'center', p: 1, borderRadius: '6px', '&:hover': { bgcolor: '#F5F5F5' } }}>
                            <Checkbox
                              checked={isChecked}
                              onChange={() => handleTogglePlatform(platform.platform_id)}
                              label={platform.platform_name}
                              sx={{ flex: 1 }}
                            />
                            {isChecked && (
                              hasDashboard ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  {/* --- THIS IS THE UPDATED PILL --- */}
                                  <Box
                                    onClick={() => handleOpenPbiModal(platform)}
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      padding: '2px 8px',
                                      backgroundColor: '#E5DBFF', // Light purple
                                      borderRadius: '10px',
                                      fontSize: '11px', 
                                      fontWeight: 500,
                                      color: TEXT_PRIMARY.PURPLE,
                                      cursor: 'pointer',
                                      '&:hover': {
                                        backgroundColor: '#D1C4E9' // Darker on hover
                                      }
                                    }}
                                  >
                                    {dashboardData?.dashboardType}
                                  </Box>
                                  {/* --- END OF UPDATE --- */}
                                  <IconButton size="sm" variant="plain" color="danger" onClick={() => handleRemovePbiDashboard(platform.platform_id)}>
                                    <Delete sx={{fontSize: '16px'}} />
                                  </IconButton>
                                </Stack>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outlined"
                                  startDecorator={<Add />}
                                  onClick={() => handleOpenPbiModal(platform)}
                                >
                                  Add dashboard
                                </Button>
                              )
                            )}
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                </FormControl>

                {/* Save/Cancel */}
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #E0E0E0' }}>
                  <Button variant="outlined" color="neutral" onClick={onClose} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    loading={isLoading}
                    disabled={selectedPlatformIds.size === 0}
                    sx={{ backgroundColor: TEXT_PRIMARY.PURPLE }}
                  >
                    Save & Publish
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </ModalDialog>
      </Modal>

      {/* Power BI Sub-Modal */}
      {isPbiModalOpen && pbiModalPlatform && (
        <AddDashboardModal
          open={isPbiModalOpen}
          onClose={() => setIsPbiModalOpen(false)}
          appName={appName}
          brandName={selectedBrandName} 
          platformName={pbiModalPlatform.platform_name}
          existingData={attachedDashboards.get(pbiModalPlatform.platform_id)}
          onSubmit={handleSavePbiDashboard}
        />
      )}
    </>
  );
};

export default CreateMappingModal;