import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './pages/users/AdminLayout';
import AllUsersPage from './pages/users/AllUsersPage';
import UserPage from './pages/users/UserPage';
import BrandManagementPage from './pages/brandManagement/BrandManagementPage';
import LoginPage from './pages/LoginPage/Login';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* --- 2. Add Login Route (outside admin layout) --- */}
        <Route path="/login" element={<LoginPage />} />

        {/* --- 3. Update Redirect --- */}
        {/* Redirect root to /users, which AdminLayout will protect */}
        <Route path="/" element={<Navigate to="/users" replace />} />
        
        {/* Admin Routes (with layout) */}
        <Route path="/" element={<AdminLayout />}>
          <Route path="users" element={<AllUsersPage />} />
          <Route path="users/:userId" element={<UserPage />} /> 
          <Route path="brand-management" element={<BrandManagementPage />} />
          {/* This will show the 404 page *with* the admin header */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        {/* You could also put it outside the layout if you don't want the header */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;