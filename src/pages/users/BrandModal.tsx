import React, { useState, useEffect } from 'react';
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
  dashboardName: string;
  dashboardId: string;
  userId: string;
  // For edit mode
  selectedBrandId?: string;
  selectedBrandName?: string;
  assignedPlatformIds?: string[];
  // Data
  availableBrands: AvailableBrand[];
  availablePlatforms: Platform[];
  isLoadingBrands: boolean;
  isLoadingPlatforms: boolean;
  // Actions
  onFetchPlatforms: (brandId: string) => Promise<void>;
  onSubmit: (brandId: string, platformIds: string[]) => Promise<void>;
};

const BrandModal: React.FC<BrandModalProps> = ({
  open,
  onClose,
  mode,
  dashboardName,
  dashboardId,
  userId,
  selectedBrandId,
  selectedBrandName,
  assignedPlatformIds = [],
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

  // Initialize for edit mode
  useEffect(() => {
    if (mode === 'edit' && selectedBrandId) {
      setSelectedBrand(selectedBrandId);
      setSelectedPlatforms(new Set(assignedPlatformIds));
    } else {
      setSelectedBrand('');
      setSelectedPlatforms(new Set());
    }
  }, [mode, selectedBrandId, assignedPlatformIds, open]);

  // Fetch platforms when brand changes (add mode only)
  useEffect(() => {
    if (mode === 'add' && selectedBrand && open) {
      onFetchPlatforms(selectedBrand);
    }
  }, [selectedBrand, mode, open]);

  // Handle brand selection change
  const handleBrandChange = async (brandId: string | null) => {
    if (brandId) {
      setSelectedBrand(brandId);
      setSelectedPlatforms(new Set()); // Clear platform selection
    }
  };

  // Toggle individual platform
  const togglePlatform = (platformId: string) => {
    const newSelected = new Set(selectedPlatforms);
    if (newSelected.has(platformId)) {
      newSelected.delete(platformId);
    } else {
      newSelected.add(platformId);
    }
    setSelectedPlatforms(newSelected);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedPlatforms.size === availablePlatforms.length) {
      // Deselect all
      setSelectedPlatforms(new Set());
    } else {
      // Select all
      setSelectedPlatforms(new Set(availablePlatforms.map(p => p.platform_id)));
    }
  };

  // Handle submit
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
      // Error toast handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedBrand('');
      setSelectedPlatforms(new Set());
      onClose();
    }
  };

  const isSelectAllChecked = availablePlatforms.length > 0 &&
    selectedPlatforms.size === availablePlatforms.length;

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog sx={{ width: 500, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <DialogTitle>
          {mode === 'add' ? `Add Brand to ${dashboardName}` : `Edit Brand: ${selectedBrandName}`}
        </DialogTitle>
        <DialogContent sx={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Stack spacing={2} sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Brand Selection */}
            <FormControl required>
              <FormLabel>Select Brand:</FormLabel>
              {isLoadingBrands ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
                  <CircularProgress size="sm" />
                  <Typography level="body-sm">Loading brands...</Typography>
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
            {selectedBrand && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <FormLabel sx={{ mb: 1 }}>Platforms:</FormLabel>

                {isLoadingPlatforms ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '24px'
                  }}>
                    <CircularProgress size="sm" />
                    <Typography level="body-sm">Loading platforms...</Typography>
                  </div>
                ) : availablePlatforms.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '24px',
                    color: TEXT_PRIMARY.GREY,
                    fontSize: '12px'
                  }}>
                    No platforms available for this brand
                  </div>
                ) : (
                  <div style={{
                    border: '1px solid #E0E0E0',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '300px'
                  }}>
                    {/* Select All */}
                    <div style={{
                      padding: '10px 12px',
                      backgroundColor: '#F9F9F9',
                      borderBottom: '1px solid #E0E0E0',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Checkbox
                        checked={isSelectAllChecked}
                        onChange={toggleSelectAll}
                        label={
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>
                            Select All ({availablePlatforms.length})
                          </span>
                        }
                      />
                    </div>

                    {/* Platform List */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                      {availablePlatforms.map((platform) => {
                        const isAssigned = mode === 'edit' && assignedPlatformIds.includes(platform.platform_id);
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
                              backgroundColor: isChecked ? '#F9F7FE' : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              if (!isChecked) e.currentTarget.style.backgroundColor = '#F5F5F5';
                            }}
                            onMouseLeave={(e) => {
                              if (!isChecked) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Checkbox
                              checked={isChecked}
                              onChange={() => togglePlatform(platform.platform_id)}
                              label={
                                <span style={{ fontSize: '13px' }}>
                                  {platform.platform_name}
                                </span>
                              }
                            />
                            {isAssigned && (
                              <span style={{
                                fontSize: '11px',
                                color: TEXT_PRIMARY.PURPLE,
                                backgroundColor: '#E5DBFF',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontWeight: 500
                              }}>
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
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={handleClose}
                disabled={isSubmitting}
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={
                  isSubmitting ||
                  !selectedBrand ||
                  selectedPlatforms.size === 0 ||
                  isLoadingPlatforms
                }
                sx={{
                  flex: 1,
                  backgroundColor: TEXT_PRIMARY.PURPLE,
                  color: '#fff',
                  ':hover': {
                    backgroundColor: '#7A4CD9'
                  }
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