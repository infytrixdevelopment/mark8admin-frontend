import Switch from '@mui/joy/Switch';
import React from 'react';

// Define the props type, adding 'disabled' as optional
type AppSwitchProps = {
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean; // <-- Add disabled prop here (optional)
};

const AppSwitch = (props: AppSwitchProps) => {
  const { checked, onChange, disabled } = props;
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      color={checked ? 'primary' : 'neutral'}
      sx={{
        '--Switch-thumbSize': '16px',
        '--Switch-trackWidth': '36px',
        '--Switch-trackHeight': '20px',
        '--Switch-thumbBackground': checked ? '#8E59FF' : '#fff',
        '--Switch-trackBackground': checked ? '#E5DBFF' : '#D1D5F1',
        '--Switch-trackBorderColor': checked ? '#8E59FF' : '#D1D5F1',
        '& .JoySwitch-thumb': {
          backgroundColor: checked ? '#8E59FF' : '#fff',
        },
        '& .JoySwitch-track': {
          backgroundColor: checked ? '#E5DBFF' : '#D1D5F1',
          borderColor: checked ? '#8E59FF' : '#D1D5F1',
        },
      }}
    />
  );
}

export default AppSwitch;