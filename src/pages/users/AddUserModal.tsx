import React, { useState } from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Stack from '@mui/joy/Stack';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Typography from '@mui/joy/Typography';
import toast from 'react-hot-toast';
import Input from '../../components/appComponents/inputs/Input';
import { TEXT_PRIMARY } from '../../constants/textColorsConstants';

export type AddUserPayload = {
  full_name: string;
  email: string;
  password: string;
  user_type: string;
  organisation: string;
};

type AddUserModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (userData: AddUserPayload) => Promise<void>;
};

// Only MANAGER and USER are allowed
const USER_TYPES = ['MANAGER', 'USER'];

export default function AddUserModal({ open, onClose, onSubmit }: AddUserModalProps) {
  const [formData, setFormData] = useState<AddUserPayload>({
    full_name: '',
    email: '',
    password: '',
    user_type: 'USER', // Default to USER
    organisation: ''
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<AddUserPayload>>({});

  // Clear form
  const clearForm = () => {
    setFormData({
      full_name: '',
      email: '',
      password: '',
      user_type: 'USER',
      organisation: ''
    });
    setErrors({});
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<AddUserPayload> = {};

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Organisation validation
    if (!formData.organisation.trim()) {
      newErrors.organisation = 'Organisation is required';
    } else if (formData.organisation.trim().length < 2) {
      newErrors.organisation = 'Organisation must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(formData);
      toast.success('User added successfully');
      clearForm();
      onClose();
    } catch (error: any) {
      console.error('Failed to add user', error);
      // Error toast is handled by the parent component or API call
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      clearForm();
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog sx={{ width: 500, maxHeight: '90vh', overflow: 'auto' }}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          Fill in the details to create a new user account.
        </DialogContent>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <Stack spacing={2}>
            {/* Full Name */}
            <FormControl required error={!!errors.full_name}>
              <FormLabel>Full Name</FormLabel>
              <Input
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={(e) => {
                  setFormData({ ...formData, full_name: e.target.value });
                  if (errors.full_name) {
                    setErrors({ ...errors, full_name: undefined });
                  }
                }}
              />
              {errors.full_name && (
                <Typography level="body-xs" sx={{ color: 'danger.500', mt: 0.5 }}>
                  {errors.full_name}
                </Typography>
              )}
            </FormControl>

            {/* Email */}
            <FormControl required error={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                placeholder="Enter email address"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
              />
              {errors.email && (
                <Typography level="body-xs" sx={{ color: 'danger.500', mt: 0.5 }}>
                  {errors.email}
                </Typography>
              )}
            </FormControl>

            {/* Password */}
            <FormControl required error={!!errors.password}>
              <FormLabel>Password</FormLabel>
              <Input
                placeholder="Enter password (min 8 characters)"
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined });
                  }
                }}
              />
              {errors.password && (
                <Typography level="body-xs" sx={{ color: 'danger.500', mt: 0.5 }}>
                  {errors.password}
                </Typography>
              )}
            </FormControl>

            {/* User Type - Only MANAGER and USER */}
            <FormControl required>
              <FormLabel>User Type</FormLabel>
              <Select
                value={formData.user_type}
                onChange={(_, value) => setFormData({ ...formData, user_type: value as string })}
                sx={{
                  width: '100%',
                  border: '1px solid #E0E0E0',
                  backgroundColor: '#FFFFFF',
                }}
              >
                {USER_TYPES.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </FormControl>

            {/* Organisation */}
            <FormControl required error={!!errors.organisation}>
              <FormLabel>Organisation</FormLabel>
              <Input
                placeholder="Enter organisation name"
                value={formData.organisation}
                onChange={(e) => {
                  setFormData({ ...formData, organisation: e.target.value });
                  if (errors.organisation) {
                    setErrors({ ...errors, organisation: undefined });
                  }
                }}
              />
              {errors.organisation && (
                <Typography level="body-xs" sx={{ color: 'danger.500', mt: 0.5 }}>
                  {errors.organisation}
                </Typography>
              )}
            </FormControl>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              sx={{
                backgroundColor: isLoading ? '#D1D5F1' : '#8E59FF',
                color: '#fff',
                ':hover': {
                  backgroundColor: isLoading ? '#D1D5F1' : '#7A4CD9'
                }
              }}
            >
              Add User
            </Button>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}