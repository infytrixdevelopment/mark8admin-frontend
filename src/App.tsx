import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './pages/users/AdminLayout';
import AllUsersPage from './pages/users/AllUsersPage';
import UserPage from './pages/users/UserPage';
import BrandManagementPage from '../src/pages/brandManagement/BrandManagementPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/users" replace />} />
        
        {/* Admin Routes (with layout) */}
        <Route path="/" element={<AdminLayout />}>
          <Route path="users" element={<AllUsersPage />} />
          <Route path="users/:userId" element={<UserPage />} /> {/* <-- FIX: Moved this inside */}
          <Route path="brand-management" element={<BrandManagementPage />} />
        </Route>

        {/* Removed the standalone route */}
        {/* <Route path="/users/:userId" element={<UserPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;