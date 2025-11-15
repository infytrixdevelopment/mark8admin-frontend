import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Option,
  Button,
  Checkbox,
  Typography,
  CircularProgress
} from '@mui/joy';
import { TEXT_PRIMARY } from '../../constants/textColorsConstants';
import toast from 'react-hot-toast';

type Platform = {
  platform_id: string;
  platform_name: string;
  platform_logo_url?: string;
};

type AvailableBrand = {
  brand_id: string;
  brand_name: string;
};

type BrandModalProps = {
  open: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  appName: string; // <-- 1. ADD THIS LINE
  appId: string;
  userId: string;
  selectedBrandId?: string;
  selectedBrandName?: string;
  assignedPlatformIds?: string[];
  availableBrands: AvailableBrand[];
  availablePlatforms: Platform[];
  isLoadingBrands: boolean;
  isLoadingPlatforms: boolean;
  onFetchPlatforms: (brandId: string) => Promise<void>;
  onSubmit: (brandId: string, platformIds: string[]) => Promise<void>;
};

const BrandModal: React.FC<BrandModalProps> = ({
  open,
  onClose,
  mode,
  appName,
  selectedBrandId,
  selectedBrandName,
  assignedPlatformIds,
  availableBrands,
  availablePlatforms,
  isLoadingBrands,
  isLoadingPlatforms,
  onFetchPlatforms,
  onSubmit
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && selectedBrandId && assignedPlatformIds) {
      setSelectedBrand(selectedBrandId);
      setSelectedPlatforms(new Set(assignedPlatformIds));
    } else {
      setSelectedBrand('');
      setSelectedPlatforms(new Set());
    }
  }, [mode, selectedBrandId, assignedPlatformIds, open]);

  useEffect(() => {
    if (mode === 'add' && selectedBrand && open) {
      onFetchPlatforms(selectedBrand);
    }
  }, [selectedBrand, mode, open, onFetchPlatforms]);

  const handleBrandChange = (brandId: string | null) => {
    if (brandId) {
      setSelectedBrand(brandId);
      setSelectedPlatforms(new Set());
    }
  };

  const togglePlatform = (platformId: string) => {
    const newSelected = new Set(selectedPlatforms);
    if (newSelected.has(platformId)) {
      newSelected.delete(platformId);
    } else {
      newSelected.add(platformId);
    }
    setSelectedPlatforms(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedPlatforms.size === availablePlatforms.length) {
      setSelectedPlatforms(new Set());
    } else {
      setSelectedPlatforms(new Set(availablePlatforms.map(p => p.platform_id)));
    }
  };

  const handleSubmit = async () => {
    if (!selectedBrand) {
      toast.error('Please select a brand');
      return;
    }
    if (selectedPlatforms.size === 0) {
      toast.error('Please select at least one platform');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(selectedBrand, Array.from(selectedPlatforms));
      toast.success(mode === 'add' ? 'Brand added successfully' : 'Brand updated successfully');
      onClose();
    } catch (error) {
      console.error('Error submitting brand:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // --- NEW SORTING LOGIC ---
  const sortedPlatforms = useMemo(() => {
    if (!availablePlatforms) {
      return [];
    }

    // Create a copy to avoid mutating the prop
    const platformsToSort = [...availablePlatforms];

    // In 'add' mode, or if assignedPlatformIds isn't provided, just sort alphabetically
    if (mode === 'add' || !assignedPlatformIds) {
      return platformsToSort.sort((a, b) => a.platform_name.localeCompare(b.platform_name));
    }

    // In 'edit' mode, sort by 'assigned' status first, then alphabetically
    return platformsToSort.sort((a, b) => {
      // Use assignedPlatformIds for the initial sort, not the changing state
      const isASelected = assignedPlatformIds.includes(a.platform_id);
      const isBSelected = assignedPlatformIds.includes(b.platform_id);

      if (isASelected && !isBSelected) {
        return -1; // a (selected) comes before b (not selected)
      }
      if (!isASelected && isBSelected) {
        return 1; // b (selected) comes before a (not selected)
      }

      // If both are selected or both are not selected, sort alphabetically
      return a.platform_name.localeCompare(b.platform_name);
    });
  }, [availablePlatforms, assignedPlatformIds, mode]);
  // --- END NEW LOGIC ---

  const isSelectAllChecked = availablePlatforms.length > 0 &&
    selectedPlatforms.size === availablePlatforms.length;

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog sx={{ width: 500, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <DialogTitle>
          {/* This line will now work correctly */}
          {mode === 'add' ? `Add Brand to ${appName}` : `Edit Brand: ${selectedBrandName}`}
        </DialogTitle>
        <DialogContent sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Stack spacing={2} sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Brand Selection */}
            <FormControl required>
              <FormLabel>Select Brand:</FormLabel>
              {isLoadingBrands ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                  <CircularProgress size="sm" /> <Typography level="body-sm">Loading brands...</Typography>
                </div>
              ) : (
                <Select
                  value={selectedBrand}
                  onChange={(_, value) => handleBrandChange(value)}
                  disabled={mode === 'edit' || isLoadingBrands}
                  placeholder="Choose a brand"
                  sx={{
                    width: '100%',
                    border: '1px solid #E0E0E0',
                    backgroundColor: mode === 'edit' ? '#F5F5F5' : '#FFFFFF',
                  }}
                >
                  {mode === 'edit' ? (
                    <Option value={selectedBrandId}>{selectedBrandName}</Option>
                  ) : (
                    availableBrands.map((brand) => (
                      <Option key={brand.brand_id} value={brand.brand_id}>
                        {brand.brand_name}
                      </Option>
                    ))
                  )}
                </Select>
              )}
            </FormControl>

            {/* Platforms Section */}
            {(selectedBrand || mode === 'edit') && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <FormLabel sx={{ mb: 1 }}>Platforms:</FormLabel>
                {isLoadingPlatforms ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '24px' }}>
                    <CircularProgress size="sm" /> <Typography level="body-sm">Loading platforms...</Typography>
                  </div>
                ) : availablePlatforms.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: TEXT_PRIMARY.GREY, fontSize: '12px' }}>
                    No platforms available for this brand
                  </div>
                ) : (
                  <div style={{ border: '1px solid #E0E0E0', borderRadius: '6px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '300px' }}>
                    <div style={{ padding: '10px 12px', backgroundColor: '#F9F9F9', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        checked={isSelectAllChecked}
                        onChange={toggleSelectAll}
                        label={<span style={{ fontSize: '13px', fontWeight: 500 }}>Select All ({availablePlatforms.length})</span>}
                      />
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                      {/* --- UPDATED TO USE sortedPlatforms --- */}
                      {sortedPlatforms.map((platform) => {
                        const isAssigned = mode === 'edit' && assignedPlatformIds?.includes(platform.platform_id);
                        const isChecked = selectedPlatforms.has(platform.platform_id);
                        return (
                          <div
                            key={platform.platform_id}
                            style={{
                              padding: '8px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderRadius: '4px',
                              transition: 'background-color 0.2s',
                              backgroundColor: isChecked ? '#F9F7FE' : 'transparent',
                              cursor: 'pointer'
                            }}
                            onClick={() => togglePlatform(platform.platform_id)}
                          >
                            <Checkbox
                              checked={isChecked}
                              onChange={() => togglePlatform(platform.platform_id)}
                              label={<span style={{ fontSize: '13px' }}>{platform.platform_name}</span>}
                            />
                            {isAssigned && (
                              <span style={{ fontSize: '11px', color: TEXT_PRIMARY.PURPLE, backgroundColor: '#E5DBFF', padding: '2px 8px', borderRadius: '10px', fontWeight: 500 }}>
                                ✓ Assigned
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 2, pt: 2, borderTop: '1px solid #E0E0E0' }}>
              <Button variant="outlined" color="neutral" onClick={handleClose} disabled={isSubmitting} sx={{ flex: 1 }}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting || !selectedBrand || selectedPlatforms.size === 0 || isLoadingPlatforms}
                sx={{
                  flex: 1,
                  backgroundColor: TEXT_PRIMARY.PURPLE,
                  color: '#fff',
                  ':hover': { backgroundColor: '#7A4CD9' },
                  '&.Mui-disabled': { backgroundColor: '#D1D5F1' }
                }}
              >
                {mode === 'add' ? 'Save & Publish' : 'Update'}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default BrandModal;