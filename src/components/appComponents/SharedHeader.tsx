import React, { useEffect, useState } from 'react';
import { Box, Avatar, Typography, IconButton, Dropdown, Menu, MenuButton, MenuItem, SvgIcon, Divider } from '@mui/joy';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TEXT_PRIMARY } from '../../constants/textColorsConstants';
import UserProfile from "../../ui/icons/Small/UserProfile.svg";
import AppLogo from './AppLogo'; 
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';


const UserManagementIcon = () => (
  <SvgIcon viewBox="0 0 20 20" sx={{ fill: 'currentColor' }}>
    <path d="M14.6375 10.7756C14.7913 10.7756 14.92 10.7242 15.0238 10.6214C15.1274 10.5185 15.1792 10.3908 15.1792 10.2383C15.1792 10.0858 15.1274 9.9567 15.0238 9.851C14.92 9.74517 14.7913 9.69225 14.6375 9.69225H11.6057C11.4519 9.69225 11.3232 9.74371 11.2194 9.84663C11.1158 9.9494 11.064 10.077 11.064 10.2295C11.064 10.382 11.1158 10.5111 11.2194 10.6168C11.3232 10.7227 11.4519 10.7756 11.6057 10.7756H14.6375ZM14.6375 8.37183C14.7913 8.37183 14.92 8.32038 15.0238 8.21746C15.1274 8.11468 15.1792 7.98704 15.1792 7.83454C15.1792 7.68204 15.1274 7.55288 15.0238 7.44704C14.92 7.34135 14.7913 7.2885 14.6375 7.2885H11.6057C11.4519 7.2885 11.3232 7.33989 11.2194 7.44267C11.1158 7.54558 11.064 7.67329 11.064 7.82579C11.064 7.97829 11.1158 8.10739 11.2194 8.21308C11.3232 8.31892 11.4519 8.37183 11.6057 8.37183H14.6375ZM7.0215 10.6281C6.64706 10.6281 6.31102 10.6596 6.01338 10.7227C5.71588 10.7857 5.42768 10.8803 5.1488 11.0064C4.90852 11.1271 4.71574 11.2838 4.57046 11.4764C4.42505 11.6689 4.35234 11.8754 4.35234 12.096C4.35234 12.2711 4.4047 12.4175 4.50942 12.5352C4.61414 12.6527 4.73491 12.7114 4.87171 12.7114H9.19213C9.32893 12.7114 9.44963 12.6532 9.55421 12.5366C9.65893 12.4202 9.7113 12.2761 9.7113 12.1041C9.7113 11.8744 9.63998 11.6677 9.49734 11.4839C9.3547 11.3002 9.16053 11.1479 8.91484 11.0273C8.6222 10.9011 8.32706 10.8031 8.02942 10.7331C7.73192 10.6631 7.39595 10.6281 7.0215 10.6281ZM7.0363 9.87183C7.39657 9.87183 7.70116 9.74586 7.95005 9.49392C8.19907 9.24211 8.32359 8.936 8.32359 8.57558C8.32359 8.21531 8.19762 7.91072 7.94567 7.66183C7.69386 7.41295 7.38782 7.2885 7.02755 7.2885C6.66727 7.2885 6.36261 7.4144 6.11359 7.66621C5.8647 7.91815 5.74025 8.22426 5.74025 8.58454C5.74025 8.94482 5.86616 9.2494 6.11796 9.49829C6.36991 9.74732 6.67602 9.87183 7.0363 9.87183ZM3.7563 15.5833C3.38116 15.5833 3.06407 15.4537 2.80505 15.1945C2.54602 14.9354 2.4165 14.6181 2.4165 14.2427V5.75058C2.4165 5.37517 2.54602 5.05899 2.80505 4.80204C3.06407 4.5451 3.38116 4.41663 3.7563 4.41663H16.2434C16.6185 4.41663 16.9356 4.54621 17.1946 4.80538C17.4537 5.06454 17.5832 5.38183 17.5832 5.75725V14.2493C17.5832 14.6248 17.4537 14.9409 17.1946 15.1979C16.9356 15.4548 16.6185 15.5833 16.2434 15.5833H3.7563ZM3.7563 14.5H16.2434C16.3075 14.5 16.3663 14.4732 16.4196 14.4198C16.4731 14.3664 16.4998 14.3077 16.4998 14.2435V5.75642C16.4998 5.69225 16.4731 5.6335 16.4196 5.58017C16.3663 5.52669 16.3075 5.49996 16.2434 5.49996H3.7563C3.69213 5.49996 3.63338 5.52669 3.58005 5.58017C3.52657 5.6335 3.49984 5.69225 3.49984 5.75642V14.2435C3.49984 14.3077 3.52657 14.3664 3.58005 14.4198C3.63338 14.4732 3.69213 14.5 3.7563 14.5Z" fill="currentColor"/>
  </SvgIcon>
);

const BrandManagementIcon = () => (
  <SvgIcon viewBox="0 0 20 20" sx={{ fill: 'currentColor' }}>
    <path d="M14.173 15.2468L14.0511 14.5704C13.8247 14.5052 13.61 14.4148 13.4069 14.2989C13.2039 14.1829 13.0233 14.0464 12.8653 13.8893L12.1825 14.1377C12.0778 14.1686 11.9857 14.1654 11.9063 14.1279C11.8269 14.0904 11.764 14.0311 11.7178 13.9502L11.6073 13.7756C11.5646 13.6986 11.5461 13.614 11.5519 13.5216C11.5579 13.4293 11.595 13.3462 11.6634 13.2725L12.2034 12.7933C12.1157 12.5775 12.0754 12.344 12.0823 12.0929C12.0893 11.8418 12.1296 11.6084 12.2034 11.3927L11.6921 10.9183C11.6238 10.8445 11.5819 10.765 11.5663 10.6795C11.5509 10.594 11.5646 10.5058 11.6073 10.415L11.7098 10.2483C11.7526 10.1522 11.8207 10.0857 11.9142 10.0489C12.0077 10.012 12.1068 10.009 12.2115 10.04L12.8444 10.2677C12.9972 10.0967 13.1799 9.95114 13.3925 9.831C13.6052 9.71072 13.8247 9.62815 14.0511 9.58329L14.173 8.88454C14.1909 8.78746 14.2393 8.70927 14.3182 8.64996C14.3971 8.59065 14.4891 8.561 14.5944 8.561H14.7738C14.8732 8.561 14.9654 8.58871 15.0503 8.64413C15.1353 8.69968 15.1836 8.77718 15.1953 8.87663L15.3092 9.58329C15.5356 9.64204 15.7551 9.7267 15.9678 9.83725C16.1804 9.94795 16.3631 10.0861 16.5159 10.2516L17.1857 10.0241C17.2851 9.99843 17.3741 10.0075 17.4525 10.0512C17.531 10.0951 17.5916 10.1555 17.6344 10.2325L17.753 10.407C17.7957 10.484 17.8094 10.5673 17.7938 10.657C17.7784 10.7468 17.7365 10.8285 17.6682 10.9023L17.1778 11.3558C17.2376 11.5961 17.2675 11.8395 17.2675 12.086C17.2675 12.3324 17.2307 12.5682 17.1569 12.7933L17.6761 13.2516C17.7444 13.3254 17.785 13.4098 17.798 13.5048C17.8107 13.5999 17.7957 13.6859 17.753 13.7627L17.6505 13.9293C17.6019 14.0103 17.5371 14.0695 17.4563 14.107C17.3753 14.1445 17.2825 14.1478 17.1778 14.1168L16.495 13.8893C16.3369 14.0464 16.1563 14.1864 15.9534 14.3093C15.7503 14.4321 15.5356 14.5159 15.3092 14.5608L15.1744 15.2595C15.1576 15.3566 15.1117 15.4349 15.0367 15.4943C14.9616 15.5536 14.8739 15.5833 14.7738 15.5833H14.5736C14.4734 15.5833 14.3859 15.5518 14.3109 15.4889C14.2357 15.426 14.1898 15.3453 14.173 15.2468ZM9.99984 9.95183C10.0789 9.7542 10.1665 9.56378 10.2628 9.38058C10.3589 9.19739 10.4721 9.02135 10.6023 8.85246H8.36525C8.2115 8.85246 8.08275 8.90433 7.979 9.00808C7.87539 9.1117 7.82359 9.24038 7.82359 9.39413C7.82359 9.55732 7.88581 9.69642 8.01025 9.81142C8.1347 9.92642 8.28241 9.97322 8.45338 9.95183H9.99984ZM9.564 12.7595C9.54692 12.6602 9.53275 12.5478 9.5215 12.4223C9.51025 12.2967 9.50463 12.18 9.50463 12.072C9.50463 12.0101 9.50449 11.9462 9.50421 11.8804C9.5038 11.8145 9.50553 11.7465 9.50942 11.6762H5.78192C5.62817 11.6762 5.49942 11.7277 5.39567 11.8306C5.29206 11.9334 5.24025 12.061 5.24025 12.2135C5.24025 12.366 5.29206 12.4952 5.39567 12.601C5.49942 12.7067 5.62817 12.7595 5.78192 12.7595H9.564ZM3.7563 15.5833C3.38657 15.5833 3.07081 15.4523 2.809 15.1904C2.54734 14.9286 2.4165 14.6127 2.4165 14.2427V5.75058C2.4165 5.38058 2.54734 5.06572 2.809 4.806C3.07081 4.54642 3.38657 4.41663 3.7563 4.41663H16.2434C16.6131 4.41663 16.9289 4.54746 17.1907 4.80913C17.4523 5.07093 17.5832 5.3867 17.5832 5.75642V6.93913C17.5832 7.09288 17.5317 7.22156 17.4288 7.32517C17.326 7.42892 17.1984 7.48079 17.0459 7.48079C16.8934 7.48079 16.7643 7.42892 16.6586 7.32517C16.5528 7.22156 16.4998 7.09288 16.4998 6.93913V5.75642C16.4998 5.68156 16.4758 5.6201 16.4278 5.57204C16.3797 5.52399 16.3182 5.49996 16.2434 5.49996H3.7563C3.68143 5.49996 3.61998 5.52399 3.57192 5.57204C3.52387 5.6201 3.49984 5.68156 3.49984 5.75642V14.2435C3.49984 14.3184 3.52387 14.3798 3.57192 14.4279C3.61998 14.4759 3.68143 14.5 3.7563 14.5H9.94859C10.1023 14.5 10.231 14.5513 10.3346 14.6541C10.4384 14.757 10.4903 14.8848 10.4903 15.0373C10.4903 15.1898 10.4384 15.3188 10.3346 15.4245C10.231 15.5304 10.1023 15.5833 9.94859 15.5833H3.7563ZM14.6805 13.492C15.0728 13.492 15.4069 13.3527 15.6825 13.0741C15.9582 12.7955 16.0961 12.46 16.0961 12.0677C16.0961 11.6753 15.9568 11.3413 15.6782 11.0656C15.3996 10.79 15.0641 10.6523 14.6717 10.6523C14.2794 10.6523 13.9453 10.7916 13.6696 11.0702C13.3941 11.3488 13.2563 11.6842 13.2563 12.0764C13.2563 12.4688 13.3956 12.8028 13.6742 13.0785C13.9528 13.3542 14.2882 13.492 14.6805 13.492ZM5.77755 9.93579C5.93005 9.93579 6.05914 9.8844 6.16484 9.78163C6.27067 9.67871 6.32359 9.551 6.32359 9.3985C6.32359 9.246 6.27213 9.1169 6.16921 9.01121C6.06643 8.90538 5.9388 8.85246 5.7863 8.85246C5.6338 8.85246 5.50463 8.90392 5.3988 9.00683C5.2931 9.10961 5.24025 9.23725 5.24025 9.38975C5.24025 9.54225 5.29164 9.67142 5.39442 9.77725C5.49734 9.88295 5.62505 9.93579 5.77755 9.93579Z" fill="currentColor"/>
  </SvgIcon>
);

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
  const location = useLocation(); // <-- Get current location
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

  // Helper function to determine if a menu item is active
  const getActiveStyles = (pathPrefix: string) => {
    const isActive = location.pathname.startsWith(pathPrefix);
    return {
      color: isActive ? TEXT_PRIMARY.PURPLE : 'inherit',
      backgroundColor: isActive ? '#F9F7FE' : 'transparent', 
      fontWeight: isActive ? 600 : 400,
      '&:hover': {
        backgroundColor: isActive ? '#F9F7FE' : '#F5F5F5', 
      }
    };
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
        backgroundColor: "rgb(18, 24, 43)",
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
          
          {/* --- UPDATED MENU --- */}
          <Menu 
            sx={{ 
              minWidth: 220, 
              p: 0.5,
              // Apply gap to all menu items
              '& .MuiMenuItem-root': { 
                gap: '12px',
                borderRadius: '6px',
                margin: '4px',
              } 
            }}
          >
            <MenuItem 
              onClick={() => navigate('/users')}
              sx={getActiveStyles('/users')}
            >
              <UserManagementIcon />
              User Management
            </MenuItem>
            
            <MenuItem 
              onClick={() => navigate('/brand-management')}
              sx={getActiveStyles('/brand-management')}
            >
              <BrandManagementIcon />
              Brand Management
            </MenuItem>
            
            <Divider sx={{ my: 0.5 }} />
            
            <MenuItem 
              onClick={handleLogout} 
              sx={{ 
                color: 'danger.500', 
                '&:hover': {
                  backgroundColor: 'danger.50',
                }
              }}
            >
              <PowerSettingsNewIcon />
              Logout
            </MenuItem>
          </Menu>
          {/* --- END OF UPDATED MENU --- */}

        </Dropdown>
      </div>

      {/* App Tabs Bar (Optional) */}
      {showTabs && tabs.length > 0 && (
        <div style={{
          backgroundColor: TEXT_PRIMARY.WHITE,
          // --- 1. UPDATED HEIGHT ---
          height: "42px",
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
                // --- 2. UPDATED PADDING ---
                padding: "8px 16px",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                alignSelf: "stretch",
                borderBottom: activeTab === tab.id
                  // --- 3. UPDATED BORDER ---
                  ? `2px solid ${TEXT_PRIMARY.PURPLE}`
                  : "2px solid transparent",
                cursor: "pointer",
                transition: 'all 0.2s ease-in-out',
                backgroundColor: activeTab === tab.id ? '#F9F7FE' : 'transparent',
              }}
              key={tab.id}
              onClick={() => onTabChange && onTabChange(tab.id)}
            >
              <div style={{
                color: activeTab === tab.id ? TEXT_PRIMARY.PURPLE : TEXT_PRIMARY.GREY,
                // --- 4. UPDATED FONT SIZE ---
                fontSize: "12px",
                fontStyle: "normal",
                fontWeight: activeTab === tab.id ? 600 : 400,
                lineHeight: "16px",
              }}>
                {tab.name}
                {tab.count !== undefined && (
                  <span style={{
                    marginLeft: '6px',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    // --- 5. UPDATED COUNT FONT SIZE ---
                    fontSize: '10px',
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