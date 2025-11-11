import React, { useEffect, useState,useMemo } from 'react'

import { PRIMARY, TEXT_PRIMARY } from '../../constants/textColorsConstants';
import toast from 'react-hot-toast';
// import { DropdownCmp } from '../../ui/FormControls';
// import ActiveNotificationIcon from "../../ui/icons/Small/ActiveNotificationIcon.svg";
// import UserProfile from "../../ui/icons/Small/UserProfile.svg";
import { useDispatch, useSelector } from 'react-redux';
import { updateAppData, setPlatformAccessStatus,setUserAccess } from '../../redux/appDataSlice';
import { useNavigate } from 'react-router-dom'; // Remove useParams if not needed
import "./Header.css";
// import FlagIcon from './FlagIcon';
// {brandId: 'cae3a4e6-9768-4a00-bea2-8e0c4137f0e6', brandName: 'Nat Habit', categoryHierarchyLevel: 4}
import { Box, Avatar, Typography, IconButton, Dropdown, Menu, MenuButton, MenuItem } from '@mui/joy'; // Import Joy UI components

import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'; // Dropdown Icon
import UserProfile from "../../ui/icons/Small/UserProfile.svg";
import AppLogo from './AppLogo.tsx';



type Platform = {
  platformId: string;
  platformName: string;
}

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Update state selection based on new slice structure
  const { brand_id, platform_id, page_name, userAccess } = useSelector((state: any) => state.appData);
const [userName, setUserName] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  useEffect(() => {
    setUserName(localStorage.getItem("full_name"));
    setUserType(localStorage.getItem("user_type"));
  }, []);
  // Hardcoded platforms - Ensure IDs match your setup
  // const [platforms, setPlatforms] = useState<Platform[]>([
  //   {
  //     platformId: "8dfb8f2a-3d54-4c88-98c4-bad3e2a30001", // Amazon ID (Samuel has access)
  //     platformName: "Amazon"
  //   },{
  //     platformId: "492b269a-4462-4243-869c-873b483a2121", // Noon ID (Samuel *doesn't* have access)
  //     platformName: "Noon"
  //   }
  // ]);
// --- Derive accessible platforms using useMemo ---
  const accessiblePlatforms = useMemo(() => {
    if (!userAccess || !userAccess.brands || !brand_id) {
      return []; // Return empty if data is missing
    }
    // Find the currently selected brand in the user's access list
    const currentBrandAccess = userAccess.brands.find((b: any) => b.brand_id === brand_id);

    // If the brand is found and has platforms, map them to the Platform type
    if (currentBrandAccess && currentBrandAccess.platforms) {
      return currentBrandAccess.platforms.map((p: any) => ({
        platformId: p.platform_id, // Ensure names match your Platform type
        platformName: p.platform_name,
      }));
    }

    return []; // Return empty if brand not found or has no platforms
  }, [userAccess, brand_id]); // Recalculate only when userAccess or brand_id changes

  const pages = [ /* ... pages array remains the same ... */
    { name: "Dashboard", id: "visibilityDashboard" },
    { name: "Visibilty", id: "visibility" }, { name: "PDP", id: "pdp" },
    { name: "Keyword", id: "keyword" }, { name: "SKU", id: "sku" },
    { name: "Competitor", id: "competitor" },
    {name: "Category", id:"category"}
  ];


//  useEffect(() => {
//   dispatch(updateBrandData({ 
//     page_name: pages[0]?.id, 
//     platform_id: platforms[0]?.platformId,
//     brand_id: 'aa2e3f4a-6b5c-4d9e-9f99-6a3e2c1b0001',
//   }));
//  }, []);
//   //const [moduleLoading, setModuleLoading] = useState<boolean>(false);
// --- Effect to check platform access when brand or platforms change ---
  useEffect(() => {
    console.log("Header Effect: Running check. Current platform_id:", platform_id); // Log selected platform
    console.log("Header Effect: Accessible Platforms:", accessiblePlatforms); // Log calculated list
    
    // Check if the currently selected platform_id is actually in the accessible list
    const isCurrentPlatformAccessible = accessiblePlatforms.some((p:Platform) => p.platformId === platform_id);
console.log("Header Effect: Is current platform accessible?", isCurrentPlatformAccessible); // Log check result
    // If the list is empty OR the current selection is invalid, set access to false
    if (accessiblePlatforms.length === 0 || !isCurrentPlatformAccessible) {
      console.log("Header Effect: Dispatching setPlatformAccessStatus(false)");
        dispatch(setPlatformAccessStatus(false));
        // Optionally clear platform_id if the list is empty
        // if (accessiblePlatforms.length === 0) {
        //     dispatch(updateAppData({ platform_id: "" }));
        // }
    } else {
      console.log("Header Effect: Dispatching setPlatformAccessStatus(true)");
        dispatch(setPlatformAccessStatus(true)); // Otherwise, access is true
    }
    // Depend on the calculated list and the selected platform ID
  }, [accessiblePlatforms, platform_id, dispatch]);
const onPlatformChangeHandler = (selectedPlatform: Platform) => {
    // 1. Find the current brand's data in userAccess
    const currentBrandAccess = userAccess.brands.find((b: any) => b.brand_id === brand_id);

    // 2. Check if the user has access to the selected platform within that brand
    let hasAccess = false;
    if (currentBrandAccess) {
      hasAccess = currentBrandAccess.platforms.some((p: any) => p.platform_id === selectedPlatform.platformId);
    }

    // 3. Update Redux state
    dispatch(setPlatformAccessStatus(hasAccess)); // Update access status flag
    dispatch(updateAppData({ platform_id: selectedPlatform.platformId, platform_name: selectedPlatform.platformName }));


    // 4. Optionally navigate or clear data if needed (handled in KeywordPage now)
    // 5. Show toast if access is denied ✨
    // if (!hasAccess) {
    //   toast.error("You do not have access to this platform.");
    // }
  }

const onPageChangeHandler = (ag_pageObj: any) => {
    dispatch(updateAppData({ page_name: ag_pageObj?.id }));
    navigate(`/${ag_pageObj.id}`); // Ensure navigation happens
  }

 
const onLogoClickHandler = () => {
    // dispatch(updateAppData({ module_id: "" })); // module_id might not be needed
    // Consider navigating to a default/dashboard page if applicable
     if (pages.length > 0) {
       dispatch(updateAppData({ page_name: pages[0].id }));
       navigate(`/${pages[0].id}`);
     }
  }

  // useEffect(() => {
  //   if (brandId && countryId && appName) {
  //     fetchPlatforms(brandId, countryId);
  //   }
  // }, [brandId, countryId, appName]);

  // --- Logout Handler ---
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('full_name');
    localStorage.removeItem('user_type');
    localStorage.removeItem('access');

    // Optional: Clear Redux state by dispatching initial state or specific clear actions
    // For simplicity, we can reset the userAccess part
    dispatch(setUserAccess({ brands: [] })); // Clear access in Redux
    dispatch(updateAppData({ brand_id: '', brand_name: '', platform_id: '', platform_name: '', page_name: '', hasCurrentPlatformAccess: false })); // Clear selections


    // Navigate to login page
    navigate('/login', { replace: true }); // Use replace to prevent going back
    toast.success("Logged out successfully.");
  };
return (
    <div style={{
      height: "auto", // Keeps container height flexible
      display: 'flex',
      flexDirection: "column",
      alignItems: "flex-start"
    }}>
      {/* --- Top Black Bar --- */}
      <div style={{
        backgroundColor: PRIMARY.BLACK,
        height: "50px", // Fixed height for the bar
        display: "flex",
        padding: "0px 24px", // Horizontal padding only
        justifyContent: "space-between", // Pushes left and right sides apart
        alignItems: "center", // Vertically centers items
        alignSelf: "stretch", // Ensures bar stretches full width
        boxSizing: "border-box" // Includes padding in height/width
      }}>
        {/* --- Left Side: Logo & Page Links --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Logo */}
          <div
            style={{
              height: "fit-content",
              width: "fit-content",
              cursor: 'pointer' // Add cursor pointer for click indication
            }}
            onClick={onLogoClickHandler} // Assumes this function exists
          >
            {/* Your SVG Logo Code */}
          <AppLogo height={26} />
          </div>

          {/* Page Links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {pages.map((page: any) => (
              <div onClick={() => onPageChangeHandler(page)}
                   className={`header-page-button ${page_name === page.id ? 'header-page-button-active' : ''}`}
                   key={page.id}>
                {page.name}
              </div>
            ))}
          </Box>
        </Box>

        {/* --- Right Side: User Profile Dropdown --- */}
        {/* User Info Dropdown: Make icon, name, and usertype all clickable */}
        <Dropdown>
          <MenuButton
            slots={{ root: IconButton }}
            slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm', sx: { color: TEXT_PRIMARY.WHITE, display: 'flex', alignItems: 'center', gap: 1, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } } } }}
          >
            <Avatar size="sm" sx={{ mr: 1 }}>
              <img src={UserProfile} alt="User Profile" />
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mr: 1 }}>
              <Typography level="title-sm" sx={{ color: TEXT_PRIMARY.WHITE }}>
                {userName || 'User'}
              </Typography>
              <Typography level="body-xs" sx={{ color: TEXT_PRIMARY.GREY }}>
                {userType || 'Role'}
              </Typography>
            </Box>
            <KeyboardArrowDown />
          </MenuButton>
          <Menu sx={{ minWidth: 120 }}>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
            {/* Add other menu items here if needed later */}
          </Menu>
        </Dropdown>
      </div>

      {/* --- Platform Tabs Bar --- */}
      <div style={{
        backgroundColor: TEXT_PRIMARY.WHITE,
        height: "42px",
        padding: "0px 24px",
        display: "flex",
        alignItems: "center",
        alignSelf: "stretch",
        borderBottom: "1px solid #ECF0FF",
      }}>
        {/* Map over the derived accessiblePlatforms */}
        {accessiblePlatforms.map((platform: Platform) => (
          <div
            style={{
              display: "flex",
              padding: "8px 24px",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              alignSelf: "stretch",
              // Highlight the selected platform tab
              borderBottom: platform_id === platform?.platformId ? `2px solid ${TEXT_PRIMARY.PURPLE}` : "2px solid transparent", // Use transparent border for consistent height
              cursor: "pointer",
              transition: 'border-bottom 0.2s ease-in-out', // Smooth transition
            }}
            key={platform?.platformId}
            onClick={() => onPlatformChangeHandler(platform)}
          >
            <div style={{
              // Style the text based on selection
              color: platform_id === platform?.platformId ? TEXT_PRIMARY.PURPLE : TEXT_PRIMARY.GREY,
              fontSize: "12px",
              fontStyle: "normal",
              fontWeight: platform_id === platform?.platformId ? 600 : 400,
              lineHeight: "16px",
             }}>
              {platform?.platformName}
            </div>
          </div>
        ))}
        {/* Optional: Show a message if no platforms are accessible for the selected brand */}
        {accessiblePlatforms.length === 0 && brand_id && ( // Show only if a brand is selected
             <div style={{ padding: "8px 24px", color: TEXT_PRIMARY.GREY, fontSize: "12px" }}>
                 No accessible platforms for this brand.
             </div>
         )}
      </div>
    </div>
  );
}

export default Header;