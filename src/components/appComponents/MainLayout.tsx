import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from './Header'
import { useSelector, useDispatch } from 'react-redux' // Import useDispatch
import { setUserAccess, updateAppData } from '../../redux/appDataSlice'; // Import actions

type MainLayoutProps = {

}
const MainLayout:React.FC<MainLayoutProps> = ({}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appData = useSelector((state: any) => state.appData);

const { page_name } = appData; // Get state needed


useEffect(() => {
    if(page_name){
      navigate(`/${page_name}`);
    }
  }, [page_name, navigate]); // Add navigate to dependency array

  // Initialize Redux from localStorage on first load so refresh keeps selected brand/platform and access flag
  useEffect(() => {
    try {
      const accessRaw = localStorage.getItem('access');
      if (!accessRaw) return; // nothing to initialize

      const accessObj = JSON.parse(accessRaw);
      // Dispatch access into Redux
      dispatch(setUserAccess(accessObj));

      // Pick first brand/platform (if any) to initialize selected ids
      const firstBrand = accessObj?.brands?.[0];
      const firstPlatform = firstBrand?.platforms?.[0];
      const initialBrandId = firstBrand?.brand_id || '';
      const initialBrandName = firstBrand?.brand_name || '';
      const initialPlatformId = firstPlatform?.platform_id || '';
      const initialPlatformName = firstPlatform?.platform_name || '';
      const initialAccess = !!(firstBrand && firstPlatform);

      // Determine initial page_name from current URL if present, else use 'visibility' as default
      let initialPageName = window.location.pathname.replace(/^\//, '').split('/')[0] || 'visibility';
      // If page_name already exists in Redux or localStorage, don't overwrite
      const storedPageName = localStorage.getItem('page_name');
      if (storedPageName) initialPageName = storedPageName;

      dispatch(updateAppData({
        brand_id: initialBrandId,
        brand_name: initialBrandName,
        platform_id: initialPlatformId,
        platform_name: initialPlatformName,
        page_name: initialPageName,
        hasCurrentPlatformAccess: initialAccess
      }));
    } catch (err) {
      console.warn('Failed to initialize appData from localStorage', err);
    }
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  ////Mock login useEffect
//   useEffect(() => {
//     // const token = localStorage.getItem("token");
//     // ===== MOCK LOGIN START =====
//     // Aapke 'samuel@example.com' user ka token yahaan paste karein
//     // Yeh token aapko backend ke POST /api/v1/auth/login se mila tha
//         const MOCK_TOKEN= localStorage.getItem("token")||"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNiNmU1ZjhlLTVlNTQtNGNmNy04YTRlLTRhMjJlZjNjYzAwMiIsImlhdCI6MTc2MTQxMDM3NiwiZXhwIjoxNzYxNDIxMTc2fQ.R6eRRmPfs1uRbFF4cS2JinkDQldualsfzqUUdlYcsQs"; 
//     const MOCK_USER_ID = localStorage.getItem("user_id") ||"cb6e5f8e-5e54-4cf7-8a4e-4a22ef3cc002";
//     // Simulate the access data received from backend login for 'samuel@example.com'
//     // const mockUserAccess = {
//     //   brands: [
//     //     {
//     //       brand_id: "aa2e3f4a-6b5c-4d9e-9f99-6a3e2c1b0001",
//     //       brand_name: "MyTestBrand", // Make sure name matches if used
//     //       platforms: [
//     //         {
//     //           platform_id: "8dfb8f2a-3d54-4c88-98c4-bad3e2a30001",
//     //           platform_name: "Amazon" // Make sure name matches
//     //         }
//     //         // Samuel doesn't have access to Noon (ID: 492b269a...)
//     //       ]
//     //     }
//     //   ]
//     // };
//     // localStorage.setItem("token", MOCK_TOKEN);
//     // localStorage.setItem("user_id",MOCK_USER_ID);
//     // localStorage.setItem("access",JSON.stringify(mockUserAccess));
//     // ===== MOCK LOGIN END =====
//     // Store access data in Redux
//     const access = localStorage.getItem("access");
//     if(!access){
//       return
//     }
//     let jsonAccess = JSON.parse(access);

      
//         dispatch(setUserAccess(jsonAccess));
    
// // Initialize default brand/platform (only if user has access)
// // --- UPDATED INITIALIZATION LOGIC ---
//     const firstBrand = jsonAccess.brands?.[0]; // Safely access first brand
//     let initialBrandId = "";
//     let initialPlatformId = "";
//     let initialAccess = false; // Default to no access

//     if (firstBrand && firstBrand.platforms && firstBrand.platforms.length > 0) {
//         // If first brand exists AND has platforms
//         const firstPlatform = firstBrand.platforms[0];
//         initialBrandId = firstBrand.brand_id;
//         initialPlatformId = firstPlatform.platform_id;
//         initialAccess = true; // User has access to at least one platform
//     } else if (firstBrand) {
//         // If first brand exists but has NO platforms
//         initialBrandId = firstBrand.brand_id; // Set brand_id anyway
//         initialPlatformId = ""; // No platform to select
//         initialAccess = false; // No platform access for this brand
//     }
//     // Else (no brands at all), initialAccess remains false

//     dispatch(updateAppData({
//         brand_id: initialBrandId,
//         platform_id: initialPlatformId,
//         page_name: 'keyword', // Default page
//         hasCurrentPlatformAccess: initialAccess // Set based on platform availability
//     }));
//   }, [dispatch]);
//--------------------------------------
// Navigate based on page_name from Redux (Keep this)
  useEffect(() => {
    // Only navigate if page_name is set and not already on that page
    if (page_name && window.location.pathname.replace(/^\//, '').split('/')[0] !== page_name) {
      navigate(`/${page_name}`, { replace: true });
    }
  }, [page_name, navigate]);
  
  return (
    <div style={{
        height: "100vh",
        boxSizing: "border-box",
        margin: "0px",
    }}>
        <Header />
        <div style={{ height: "calc(100vh - 92px)" }} >
            <Outlet />
        </div>
    </div>
  )
}

export default MainLayout