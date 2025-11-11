import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './pages/users/AdminLayout';
import AllUsersPage from './pages/users/AllUsersPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/users" replace />} />
        <Route path="/" element={<AdminLayout />}>
          <Route path="users" element={<AllUsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;