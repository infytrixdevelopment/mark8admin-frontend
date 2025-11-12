import React, { useState } from 'react';
import { IconButton, CircularProgress, Checkbox, Button } from '@mui/joy'; // 1. Import Checkbox and Button
import { Search, Add, Delete, ExpandMore, ChevronRight, Edit, Close } from '@mui/icons-material'; // 2. Import Close
import { TEXT_PRIMARY } from '../../constants/textColorsConstants';
import Input from './inputs/Input';

type Platform = {
  platform_id: string;
  platform_name: string;
};

type Brand = {
  brand_id: string;
  brand_name: string;
  platforms: Platform[];
};

type BrandSidebarProps = {
  brands: Brand[];
  isLoading: boolean;
  onAddBrand: () => void;
  onEditBrand: (brandId: string) => void;
  // 3. Change prop to accept multiple IDs
  onDeleteMultipleBrands: (brandIds: string[]) => void; 
  dashboardName: string;
};

const BrandSidebar: React.FC<BrandSidebarProps> = ({
  brands,
  isLoading,
  onAddBrand,
  onEditBrand,
  onDeleteMultipleBrands, // 4. Use new prop
  dashboardName
}) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [deleteMode, setDeleteMode] = useState<boolean>(false);
  
  // 5. Add new state to track selected brands
  const [selectedBrands, setSelectedBrands] = useState(new Set<string>());

  const filteredBrands = brands.filter(brand =>
    brand && 
    brand.brand_name &&
    typeof brand.brand_name === 'string' &&
    brand.brand_name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const toggleBrandExpansion = (brandId: string) => {
    const newExpanded = new Set(expandedBrands);
    if (newExpanded.has(brandId)) {
      newExpanded.delete(brandId);
    } else {
      newExpanded.add(brandId);
    }
    setExpandedBrands(newExpanded);
  };

  const handleClearSearch = () => {
    setSearchInput('');
  };

  // 6. New handler for checkbox selection
  const handleToggleBrandSelection = (brandId: string) => {
    const newSelected = new Set(selectedBrands);
    if (newSelected.has(brandId)) {
      newSelected.delete(brandId);
    } else {
      newSelected.add(brandId);
    }
    setSelectedBrands(newSelected);
  };

  // 7. New handler to reset/cancel delete mode
  const handleCancelDeleteMode = () => {
    setDeleteMode(false);
    setSelectedBrands(new Set()); // Clear selections
  };

  // 8. New handler to confirm and execute deletion
  const handleConfirmDelete = () => {
    onDeleteMultipleBrands(Array.from(selectedBrands));
    // Reset state after triggering delete
    setDeleteMode(false);
    setSelectedBrands(new Set());
  };

  return (
    <div style={{
      width: '300px',
      height: '100%',
      backgroundColor: TEXT_PRIMARY.WHITE,
      borderRight: '1px solid #ECF0FF',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }}>
      {/* Search Bar */}
      <div style={{ padding: '16px', borderBottom: '1px solid #ECF0FF' }}>
        <div style={{ position: 'relative' }}>
          <Input
            placeholder="Search brands..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
                color: TEXT_PRIMARY.PURPLE,
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
      </div>

      {/* 9. UPDATED Header: Brands + Delete Toggle */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #ECF0FF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: deleteMode ? '#FFF9F9' : '#F9F9F9', // Red-ish tint in delete mode
        minHeight: '60px' // Ensure height is consistent
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: TEXT_PRIMARY.BLACK
        }}>
          Brands ({filteredBrands.length})
        </div>
        
        {deleteMode ? (
          // --- Show this UI in Delete Mode ---
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              onClick={handleCancelDeleteMode}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              color="danger"
              variant="solid"
              disabled={selectedBrands.size === 0}
              onClick={handleConfirmDelete}
            >
              Delete ({selectedBrands.size})
            </Button>
          </div>
        ) : (
          // --- Show this UI in Normal Mode ---
          <IconButton
            size="sm"
            variant={'plain'}
            color={'neutral'}
            onClick={() => setDeleteMode(true)} // Just enter delete mode
            sx={{
              fontSize: '14px',
              padding: '4px 8px'
            }}
          >
            <Delete sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </div>

      {/* Brand List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px'
      }}>
        {/* ... (Loading, No Brands, No Search Results are the same) ... */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
            <CircularProgress size="sm" sx={{ color: TEXT_PRIMARY.PURPLE }} />
          </div>
        )}
        {!isLoading && filteredBrands.length === 0 && searchInput.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px', color: TEXT_PRIMARY.GREY, fontSize: '12px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
            No brands assigned yet
          </div>
        )}
        {!isLoading && filteredBrands.length === 0 && searchInput.length > 0 && (
          <div style={{ textAlign: 'center', padding: '24px', color: TEXT_PRIMARY.GREY, fontSize: '12px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
            No brands found for "{searchInput}"
          </div>
        )}

        {/* 10. UPDATED Brand Items */}
        {!isLoading && filteredBrands.map((brand) => {
          if (!brand || !brand.brand_id) return null;
          const isExpanded = expandedBrands.has(brand.brand_id);
          const isSelected = selectedBrands.has(brand.brand_id);

          return (
            <div
              key={brand.brand_id}
              style={{
                marginBottom: '4px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid #ECF0FF',
                // Highlight if selected in delete mode
                backgroundColor: (deleteMode && isSelected) ? '#F9F7FE' : TEXT_PRIMARY.WHITE,
              }}
            >
              {/* Brand Header */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px' }}>
                
                {/* --- Show Checkbox in Delete Mode --- */}
                {deleteMode && (
                  <div onClick={(e) => e.stopPropagation()} style={{ marginRight: '8px' }}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleBrandSelection(brand.brand_id)}
                    />
                  </div>
                )}
                
                {/* --- Show Expand/Collapse Icon in Normal Mode --- */}
                {!deleteMode && (
                  <div
                    onClick={(e) => { e.stopPropagation(); toggleBrandExpansion(brand.brand_id); }}
                    style={{ marginRight: '8px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    {isExpanded ? <ExpandMore sx={{ fontSize: 18, color: TEXT_PRIMARY.GREY }} /> : <ChevronRight sx={{ fontSize: 18, color: TEXT_PRIMARY.GREY }} />}
                  </div>
                )}

                {/* Brand Name */}
                <div
                  onClick={() => !deleteMode && onEditBrand(brand.brand_id)} // Click to edit only if NOT in delete mode
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    fontWeight: 500,
                    color: TEXT_PRIMARY.BLACK,
                    cursor: deleteMode ? 'default' : 'pointer', // No pointer in delete mode
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title={brand.brand_name}
                >
                  {brand.brand_name}
                  <span style={{ marginLeft: '6px', fontSize: '11px', color: TEXT_PRIMARY.GREY, fontWeight: 400 }}>
                    ({brand.platforms?.length || 0})
                  </span>
                </div>

                {/* Edit Icon (Only in Normal Mode) */}
                {!deleteMode && (
                  <IconButton size="sm" variant="plain" onClick={(e) => { e.stopPropagation(); onEditBrand(brand.brand_id); }} sx={{ ml: 1 }}>
                    <Edit sx={{ fontSize: 14, color: TEXT_PRIMARY.GREY }} />
                  </IconButton>
                )}
              </div>

              {/* Platform List (Expanded) */}
              {isExpanded && !deleteMode && brand.platforms && (
                <div style={{ backgroundColor: '#FAFAFA', padding: '8px 12px 8px 40px', borderTop: '1px solid #ECF0FF' }}>
                  {brand.platforms.map((platform) => (
                    <div key={platform.platform_id} style={{ padding: '6px 8px', fontSize: '12px', color: TEXT_PRIMARY.GREY, display: 'flex', alignItems: 'center' }}>
                      <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: TEXT_PRIMARY.PURPLE, marginRight: '8px' }} />
                      {platform.platform_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Brand Button */}
      <div style={{ padding: '16px', borderTop: '1px solid #ECF0FF' }}>
        <button
          onClick={onAddBrand}
          disabled={deleteMode} // Disable button in delete mode
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: deleteMode ? '#E0E0E0' : TEXT_PRIMARY.PURPLE,
            color: deleteMode ? TEXT_PRIMARY.GREY : TEXT_PRIMARY.WHITE,
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: deleteMode ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background-color 0.2s'
          }}
        >
          <Add sx={{ fontSize: 18 }} />
          Add New Brand
        </button>
      </div>
    </div>
  );
};

export default BrandSidebar;