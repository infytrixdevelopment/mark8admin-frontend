import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, IconButton, Dropdown, Menu, MenuButton, MenuItem } from '@mui/joy';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PRIMARY, TEXT_PRIMARY } from '../../constants/textColorsConstants';
import UserProfile from "../../ui/icons/Small/UserProfile.svg";
import AppLogo from '../../AppLogo/AppLogoWhite';

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    setUserName(localStorage.getItem("full_name"));
    setUserType(localStorage.getItem("user_type"));
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('full_name');
    localStorage.removeItem('user_type');

    // Navigate to login page
    navigate('/login', { replace: true });
    toast.success("Logged out successfully.");
  };

  return (
    <div style={{
      backgroundColor: PRIMARY.BLACK,
      height: "50px",
      display: "flex",
      padding: "0px 24px",
      justifyContent: "space-between",
      alignItems: "center",
      alignSelf: "stretch",
      boxSizing: "border-box"
    }}>
      {/* --- Left Side: Logo --- */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div
          style={{
            height: "fit-content",
            width: "fit-content",
            cursor: 'pointer'
          }}
          onClick={() => navigate('/users')}
        >
          <AppLogo height={26} />
        </div>
      </Box>

      {/* --- Right Side: User Profile Dropdown --- */}
      <Dropdown>
        <MenuButton
          slots={{ root: IconButton }}
          slotProps={{ 
            root: { 
              variant: 'plain', 
              color: 'neutral', 
              size: 'sm', 
              sx: { 
                color: TEXT_PRIMARY.WHITE, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                '&:hover': { 
                  bgcolor: 'rgba(255, 255, 255, 0.1)' 
                } 
              } 
            } 
          }}
        >
          <Avatar size="sm" sx={{ mr: 1 }}>
            <img src={UserProfile} alt="User Profile" />
          </Avatar>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 1 }}>
            <Typography level="title-sm" sx={{ color: TEXT_PRIMARY.WHITE }}>
              {userName || 'Admin'}
            </Typography>
            <Typography level="body-xs" sx={{ color: TEXT_PRIMARY.GREY }}>
              {userType || 'ADMIN'}
            </Typography>
          </Box>
          <KeyboardArrowDown />
        </MenuButton>
        <Menu sx={{ minWidth: 120 }}>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Dropdown>
    </div>
  );
};

export default AdminHeader;