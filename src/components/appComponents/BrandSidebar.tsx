import React, { useState } from 'react';
import { IconButton, CircularProgress } from '@mui/joy';
import { Search, Add, Delete, ExpandMore, ChevronRight, Edit } from '@mui/icons-material';
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
  onDeleteBrand: (brandId: string) => void;
  dashboardName: string;
};

const BrandSidebar: React.FC<BrandSidebarProps> = ({
  brands,
  isLoading,
  onAddBrand,
  onEditBrand,
  onDeleteBrand,
  dashboardName
}) => {
  const [searchInput, setSearchInput] = useState<string>('');
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [deleteMode, setDeleteMode] = useState<boolean>(false);

  // Filter brands by search
  const filteredBrands = brands.filter(brand =>
    brand && brand.brand_name && 
    brand.brand_name.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Toggle brand expansion
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

  return (
    <div style={{
      width: '300px',
      height: '100%',
      backgroundColor: TEXT_PRIMARY.WHITE,
      borderRight: '1px solid #ECF0FF',
      display: 'flex',
      flexDirection: 'column',
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

      {/* Header: Brands + Delete Toggle */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #ECF0FF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9F9F9'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: TEXT_PRIMARY.BLACK
        }}>
          Brands ({filteredBrands.length})
        </div>
        <IconButton
          size="sm"
          variant={deleteMode ? 'solid' : 'plain'}
          color={deleteMode ? 'danger' : 'neutral'}
          onClick={() => setDeleteMode(!deleteMode)}
          sx={{
            fontSize: '14px',
            padding: '4px 8px'
          }}
        >
          {deleteMode ? 'Done' : <Delete sx={{ fontSize: 18 }} />}
        </IconButton>
      </div>

      {/* Brand List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px'
      }}>
        {/* Loading State */}
        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px'
          }}>
            <CircularProgress size="sm" sx={{ color: TEXT_PRIMARY.PURPLE }} />
          </div>
        )}

        {/* No Brands */}
        {!isLoading && filteredBrands.length === 0 && searchInput.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '24px',
            color: TEXT_PRIMARY.GREY,
            fontSize: '12px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
            No brands assigned yet
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && filteredBrands.length === 0 && searchInput.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '24px',
            color: TEXT_PRIMARY.GREY,
            fontSize: '12px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
            No brands found for "{searchInput}"
          </div>
        )}

        {/* Brand Items */}
        {!isLoading && filteredBrands.map((brand) => {
          const isExpanded = expandedBrands.has(brand.brand_id);

          return (
            <div
              key={brand.brand_id}
              style={{
                marginBottom: '4px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid #ECF0FF',
              }}
            >
              {/* Brand Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  backgroundColor: isExpanded ? '#F9F7FE' : TEXT_PRIMARY.WHITE,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                {/* Delete Icon (if in delete mode) */}
                {deleteMode && (
                  <IconButton
                    size="sm"
                    color="danger"
                    variant="plain"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBrand(brand.brand_id);
                    }}
                    sx={{ marginRight: '8px' }}
                  >
                    <Delete sx={{ fontSize: 16 }} />
                  </IconButton>
                )}

                {/* Expand/Collapse Icon */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBrandExpansion(brand.brand_id);
                  }}
                  style={{
                    marginRight: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {isExpanded ? (
                    <ExpandMore sx={{ fontSize: 18, color: TEXT_PRIMARY.GREY }} />
                  ) : (
                    <ChevronRight sx={{ fontSize: 18, color: TEXT_PRIMARY.GREY }} />
                  )}
                </div>

                {/* Brand Name - Clicking opens Edit Modal */}
                <div
                  onClick={() => onEditBrand(brand.brand_id)}
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    fontWeight: 500,
                    color: TEXT_PRIMARY.BLACK,
                    cursor: 'pointer'
                  }}
                >
                  {brand.brand_name}
                  <span style={{
                    marginLeft: '6px',
                    fontSize: '11px',
                    color: TEXT_PRIMARY.GREY,
                    fontWeight: 400
                  }}>
                    ({brand.platforms.length})
                  </span>
                </div>

                {/* Edit Icon */}
                <IconButton
                  size="sm"
                  variant="plain"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditBrand(brand.brand_id);
                  }}
                  sx={{ ml: 1 }}
                >
                  <Edit sx={{ fontSize: 14, color: TEXT_PRIMARY.GREY }} />
                </IconButton>
              </div>

              {/* Platform List (Expanded) */}
              {isExpanded && (
                <div style={{
                  backgroundColor: '#FAFAFA',
                  padding: '8px 12px 8px 40px',
                  borderTop: '1px solid #ECF0FF'
                }}>
                  {brand.platforms.map((platform) => (
                    <div
                      key={platform.platform_id}
                      style={{
                        padding: '6px 8px',
                        fontSize: '12px',
                        color: TEXT_PRIMARY.GREY,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: TEXT_PRIMARY.PURPLE,
                        marginRight: '8px'
                      }} />
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
      <div style={{
        padding: '16px',
        borderTop: '1px solid #ECF0FF',
      }}>
        <button
          onClick={onAddBrand}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: TEXT_PRIMARY.PURPLE,
            color: TEXT_PRIMARY.WHITE,
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7A4CD9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = TEXT_PRIMARY.PURPLE}
        >
          <Add sx={{ fontSize: 18 }} />
          Add New Brand
        </button>
      </div>
    </div>
  );
};

export default BrandSidebar;