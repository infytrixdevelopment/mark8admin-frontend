import React from 'react';
import { Box, Typography } from '@mui/joy';
import { Folder, Store, Language } from '@mui/icons-material';
import { TEXT_PRIMARY } from '../../src/constants/textColorsConstants';

// Types for the incoming data
type AccessTreePlatform = {
  platform_id: string;
  platform_name: string;
};

type AccessTreeBrand = {
  brand_id: string;
  brand_name: string;
  platforms: AccessTreePlatform[];
};

type AccessTreeDashboard = {
  dashboard_id: string;
  dashboard_name: string;
  brands: AccessTreeBrand[];
};

type AccessTreeProps = {
  data: AccessTreeDashboard[];
  isLoading: boolean;
};

// Helper component for each tree item
const TreeItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  level: number; 
  color?: string; 
  bgColor?: string;
}> = ({ icon, label, level, color, bgColor }) => (
  <Box 
    sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1, 
      padding: '8px',
      paddingLeft: `${level * 24 + 12}px`, // Indentation
      backgroundColor: bgColor || 'transparent',
      borderBottom: '1px solid #F0F0F0',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#F9F7FE'
      }
    }}
  >
    <Box sx={{ color: color || TEXT_PRIMARY.GREY }}>
      {icon}
    </Box>
    <Typography level="body-sm" sx={{ color: TEXT_PRIMARY.BLACK, fontWeight: level === 0 ? 600 : 400 }}>
      {label}
    </Typography>
  </Box>
);

// Main Tree Component
const AccessTree: React.FC<AccessTreeProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return <Typography sx={{ p: 2, color: TEXT_PRIMARY.GREY }}>Loading Access Tree...</Typography>;
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: TEXT_PRIMARY.GREY }}>
        <Typography level="h4" sx={{ mb: 1 }}>🌳</Typography>
        <Typography>No access tree data found.</Typography>
        <Typography level="body-sm">Try granting access to a dashboard.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {data.map((dashboard) => (
        <Box key={dashboard.dashboard_id} sx={{ mb: 1 }}>
<TreeItem
  icon={<Folder />}
  label={dashboard.dashboard_name}
  level={0}
  color={TEXT_PRIMARY.PURPLE}
  bgColor="#F9F9F9"
/>
          {dashboard.brands.map((brand) => (
            <Box key={brand.brand_id}>
              <TreeItem
                icon={<Store />}
                label={brand.brand_name}
                level={1}
                color={TEXT_PRIMARY.PURPLE}
              />
              {brand.platforms.map((platform) => (
                <TreeItem
                  key={platform.platform_id}
                  icon={<Language />}
                  label={platform.platform_name}
                  level={2}
                  color={TEXT_PRIMARY.GREY}
                />
              ))}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default AccessTree;