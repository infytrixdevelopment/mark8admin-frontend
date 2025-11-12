import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './pages/users/AdminLayout';
import AllUsersPage from './pages/users/AllUsersPage';
import UserPage from './pages/users/UserPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/users" replace />} />
        
        {/* Admin Routes (with layout) */}
        <Route path="/" element={<AdminLayout />}>
          <Route path="users" element={<AllUsersPage />} />
        </Route>

        {/* User Detail Page (no layout - has its own header) */}
        <Route path="/users/:userId" element={<UserPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;