import React, { useEffect, useState, useCallback } from 'react';
import { Button, Option, Select, Stack, CircularProgress } from '@mui/joy';
import { Search } from '@mui/icons-material';
import toast from 'react-hot-toast';
import axios from 'axios';
import { TEXT_PRIMARY } from '../../constants/textColorsConstants';
import Switch from '../../components/appComponents/inputs/Switch';
import PaginationComponent from '../../components/appComponents/PaginationComponent';
import AddUserModal,  {type AddUserPayload } from './AddUserModal';
import Input from '../../components/appComponents/inputs/Input';

// API Base URL - adjust according to your setup
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// User type from API
type User = {
  user_id: string;
  full_name: string;
  email: string;
  user_type: string;
  organisation: string;
  status: string;
  created_time_stamp: string;
  last_login_time_stamp?: string;
};

type FilterState = {
  limit: number;
  page: number;
};

const AllUsersPage: React.FC = () => {
  const [filterState, setFilterState] = useState<FilterState>({
    limit: 10,
    page: 1,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);

  // Search states
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Loading states
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Get token from localStorage
  const getToken = () => localStorage.getItem('token');

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsFetching(true);
    
    try {
      const token = getToken();
      const params = {
        page: filterState.page,
        limit: filterState.limit,
        search: searchQuery
      };

      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params
      });

      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalRows(response.data.data.total);
      } else {
        setUsers([]);
        setTotalRows(0);
        toast.error('Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Fetch users error:', error);
      setUsers([]);
      setTotalRows(0);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch users');
      }
    } finally {
      setIsFetching(false);
    }
  }, [filterState.page, filterState.limit, searchQuery]);

  // Trigger fetch when dependencies change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle search button click
  const handleSearch = () => {
    setFilterState(prev => ({ ...prev, page: 1 }));
    setSearchQuery(searchInput);
  };

  // Clear search
  useEffect(() => {
    if (searchInput.length === 0 && searchQuery !== '') {
      setFilterState(prev => ({ ...prev, page: 1 }));
      setSearchQuery('');
    }
  }, [searchInput, searchQuery]);

  const handleClearSearch = () => {
    setSearchInput('');
    setFilterState(prev => ({ ...prev, page: 1 }));
    setSearchQuery('');
  };

  // Handle status change
  const handleStatusChange = async (user_id: string, newStatus: boolean) => {
    const originalUsers = [...users];
    
    // Optimistic update
    setUsers(prev =>
      prev.map(user =>
        user.user_id === user_id
          ? { ...user, status: newStatus ? 'ACTIVE' : 'INACTIVE' }
          : user
      )
    );

    setIsUpdating(true);

    try {
      const token = getToken();
      const response = await axios.put(
        `${API_BASE_URL}/api/admin/users/${user_id}/status`,
        { status: newStatus ? 'ACTIVE' : 'INACTIVE' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('User status updated successfully');
      } else {
        setUsers(originalUsers);
        toast.error(response.data.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Update status error:', error);
      setUsers(originalUsers);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update status');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle add user
  const handleAddUser = async (userData: AddUserPayload) => {
    setIsUpdating(true);

    try {
      const token = getToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/users`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('User added successfully');
        fetchUsers(); // Refresh the list
      } else {
        toast.error(response.data.message || 'Failed to add user');
        throw new Error('Backend error during add');
      }
    } catch (error: any) {
      console.error('Add user error:', error);
      
      if (error.response?.status === 409) {
        toast.error('Email already exists');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add user');
      }
      
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {/* Add User Modal */}
      <AddUserModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddUser}
      />

      {/* Search Bar and Add Button */}
      <div style={{ paddingTop: '24px', paddingBottom: '16px', paddingLeft: '24px', paddingRight: '24px' }}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          {/* Search Input */}
          <Stack direction="row" spacing={1} sx={{ width: '400px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Input
                placeholder="Search by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={isFetching || isUpdating}
              />
              {searchInput && (
                <span
                  onClick={handleClearSearch}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    cursor: 'pointer',
                    color: '#8E59FF',
                    fontWeight: 700,
                    fontSize: 18,
                    zIndex: 2
                  }}
                  title="Clear"
                >
                  ×
                </span>
              )}
            </div>
            <Button
              onClick={handleSearch}
              startDecorator={<Search />}
              disabled={isFetching || isUpdating}
              loading={isFetching && searchQuery.length > 0}
              sx={{
                backgroundColor: (isFetching || isUpdating) ? '#D1D5F1' : TEXT_PRIMARY.PURPLE,
                color: '#fff',
                ':hover': {
                  backgroundColor: (isFetching || isUpdating) ? '#D1D5F1' : TEXT_PRIMARY.PURPLE
                }
              }}
            >
              Search
            </Button>
          </Stack>

          {/* Add User Button */}
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outlined"
            sx={{
              color: TEXT_PRIMARY.PURPLE,
              borderColor: TEXT_PRIMARY.PURPLE,
            }}
            disabled={isFetching || isUpdating}
          >
            Add New User
          </Button>
        </Stack>
      </div>

      {/* Table Container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: 'calc(100% - 48px)',
        borderRadius: '8px',
        boxShadow: '0 4px 16px 6px rgba(130, 130, 130, 0.05)',
        marginLeft: '24px',
        marginRight: '24px',
        border: '1px solid #ECF0FF'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          height: 48,
          fontSize: 12,
          fontWeight: 700,
          backgroundColor: '#EAE4F8',
          color: '#1C1C1C',
        }}>
          <div style={{ width: '25%', padding: '16px', borderRight: '1px solid #ECF0FF' }}>
            Full Name
          </div>
          <div style={{ width: '15%', padding: '16px', borderRight: '1px solid #ECF0FF' }}>
            User Type
          </div>
          <div style={{ width: '20%', padding: '16px', borderRight: '1px solid #ECF0FF' }}>
            Organisation
          </div>
          <div style={{ width: '25%', padding: '16px', borderRight: '1px solid #ECF0FF' }}>
            Email
          </div>
          <div style={{ width: '15%', padding: '16px', textAlign: 'end' }}>
            Status
          </div>
        </div>

        {/* Table Body */}
        <div style={{
          position: 'relative',
          height: 'calc(100vh - 92px - 80px - 48px - 60px - 24px)',
          overflowY: 'auto',
          backgroundColor: TEXT_PRIMARY.WHITE
        }}>
          {/* Loading Indicator */}
          {(isFetching || isUpdating) && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1
            }}>
              <CircularProgress color="primary" sx={{ color: '#8E59FF' }} />
            </div>
          )}

          {/* No Users Message */}
          {!isFetching && users.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center', marginTop: '20px', color: TEXT_PRIMARY.GREY }}>
              No users found.
            </div>
          )}

          {/* User Rows */}
          {!isFetching && users.length > 0 && (
            users.map((user: User) => (
              <div key={user.user_id} style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                minHeight: 44,
                borderBottom: '1px solid #ECF0FF',
              }}>
                {/* Full Name */}
                <div style={{
                  width: '25%',
                  padding: '12px 16px',
                  borderRight: '1px solid #ECF0FF',
                  color: '#1C1C1C',
                  fontSize: 12,
                  wordBreak: 'break-word'
                }}>
                  {user.full_name}
                </div>

                {/* User Type */}
                <div style={{
                  width: '15%',
                  padding: '12px 16px',
                  borderRight: '1px solid #ECF0FF',
                  color: '#1C1C1C',
                  fontSize: 12
                }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: 
                      user.user_type === 'ADMIN' ? '#FFE5E5' :
                      user.user_type === 'MANAGER' ? '#E5F3FF' :
                      user.user_type === 'ANALYST' ? '#F3E5FF' :
                      '#E5FFE5',
                    color:
                      user.user_type === 'ADMIN' ? '#D32F2F' :
                      user.user_type === 'MANAGER' ? '#1976D2' :
                      user.user_type === 'ANALYST' ? '#7B1FA2' :
                      '#388E3C',
                    fontSize: 11,
                    fontWeight: 600
                  }}>
                    {user.user_type}
                  </span>
                </div>

                {/* Organisation */}
                <div style={{
                  width: '20%',
                  padding: '12px 16px',
                  borderRight: '1px solid #ECF0FF',
                  color: '#1C1C1C',
                  fontSize: 12,
                  wordBreak: 'break-word'
                }}>
                  {user.organisation}
                </div>

                {/* Email */}
                <div style={{
                  width: '25%',
                  padding: '12px 16px',
                  borderRight: '1px solid #ECF0FF',
                  color: '#656981',
                  fontSize: 12,
                  wordBreak: 'break-word'
                }}>
                  {user.email}
                </div>

                {/* Status Switch */}
                <div style={{
                  width: '15%',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <Switch
                    checked={user.status === 'ACTIVE'}
                    onChange={(e) => handleStatusChange(user.user_id, e.target.checked)}
                    disabled={isUpdating}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Footer */}
        <div style={{
          borderTop: '1px solid #ECF0FF',
          height: 60,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0px 24px',
          width: '100%',
          backgroundColor: TEXT_PRIMARY.WHITE
        }}>
          {/* Rows per page */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              fontSize: 12,
              fontWeight: 400,
              marginRight: '8px',
              color: TEXT_PRIMARY.GREY
            }}>
              Rows per page:
            </div>
            <Select
              onChange={(_, limit) => setFilterState((prevState) => ({ ...prevState, page: 1, limit: limit ? limit : 10 }))}
              value={filterState.limit}
              sx={{
                width: '80px',
                height: '28px',
                fontSize: 14,
                border: '1px solid #ECF0FF',
                backgroundColor: TEXT_PRIMARY.WHITE,
              }}
              disabled={isFetching || isUpdating}
            >
              <Option value={10}>10</Option>
              <Option value={20}>20</Option>
              <Option value={50}>50</Option>
            </Select>
          </div>

          {/* Pagination */}
          {totalRows > 0 && (
            <PaginationComponent
              page={filterState.page}
              limit={filterState.limit}
              totalRows={totalRows}
              onChange={(page) => setFilterState((prevState) => ({ ...prevState, page }))}
            />
          )}
          {totalRows === 0 && <div style={{ minWidth: '200px' }}></div>}
        </div>
      </div>

      <div style={{ height: 24 }} /> {/* Bottom space */}
    </>
  );
};

export default AllUsersPage;