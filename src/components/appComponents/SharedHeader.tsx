import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, IconButton, Dropdown, Menu, MenuButton, MenuItem } from '@mui/joy';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PRIMARY, TEXT_PRIMARY } from '../../constants/textColorsConstants';
import UserProfile from "../../ui/icons/Small/UserProfile.svg";
import AppLogo from './AppLogo'; // Make sure this path is correct
import "./Header.css";

type SharedHeaderProps = {
  showTabs?: boolean; // Optional: Show app tabs or not
  tabs?: Array<{ id: string; name: string; count?: number }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
};

const SharedHeader: React.FC<SharedHeaderProps> = ({
  showTabs = false,
  tabs = [],
  activeTab = '',
  onTabChange
}) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    setUserName(localStorage.getItem("full_name"));
    setUserType(localStorage.getItem("user_type"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('full_name');
    localStorage.removeItem('user_type');
    localStorage.removeItem('access');

    navigate('/login', { replace: true });
    toast.success("Logged out successfully.");
  };

  const onLogoClickHandler = () => {
    // Navigate to users page for admin
    navigate('/users');
  };

  return (
    <div style={{
      height: "auto",
      display: 'flex',
      flexDirection: "column",
      alignItems: "flex-start"
    }}>
      {/* Top Black Bar */}
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
        {/* Left Side: Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div
            style={{
              height: "fit-content",
              width: "fit-content",
              cursor: 'pointer'
            }}
            onClick={onLogoClickHandler}
          >
            {/* Make sure AppLogo component is imported correctly */}
            <AppLogo height={26} />
          </div>
        </Box>

        {/* Right Side: User Profile Dropdown */}
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
                {userName || 'User'}
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

      {/* App Tabs Bar (Optional) */}
      {showTabs && tabs.length > 0 && (
        <div style={{
          backgroundColor: TEXT_PRIMARY.WHITE,
          height: "50px",
          padding: "0px 24px",
          display: "flex",
          alignItems: "center",
          alignSelf: "stretch",
          borderBottom: "1px solid #ECF0FF",
        }}>
          {tabs.map((tab) => (
            <div
              style={{
                display: "flex",
                padding: "8px 24px",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                alignSelf: "stretch",
                borderBottom: activeTab === tab.id
                  ? `3px solid ${TEXT_PRIMARY.PURPLE}`
                  : "3px solid transparent",
                cursor: "pointer",
                transition: 'all 0.2s ease-in-out',
                backgroundColor: activeTab === tab.id ? '#F9F7FE' : 'transparent',
              }}
              key={tab.id}
              onClick={() => onTabChange && onTabChange(tab.id)}
            >
              <div style={{
                color: activeTab === tab.id ? TEXT_PRIMARY.PURPLE : TEXT_PRIMARY.GREY,
                fontSize: "14px",
                fontStyle: "normal",
                fontWeight: activeTab === tab.id ? 600 : 400,
                lineHeight: "20px",
              }}>
                {tab.name}
                {tab.count !== undefined && (
                  <span style={{
                    marginLeft: '6px',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    backgroundColor: activeTab === tab.id ? TEXT_PRIMARY.PURPLE : '#E0E0E0',
                    color: activeTab === tab.id ? '#FFFFFF' : TEXT_PRIMARY.GREY,
                  }}>
                    {tab.count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedHeader;