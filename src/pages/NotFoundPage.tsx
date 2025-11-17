import React from 'react';
import { Box, Button, Typography } from '@mui/joy';
import { Link } from 'react-router-dom';
import { TEXT_PRIMARY } from '../constants/textColorsConstants';

const NotFoundPage: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 50px)', // Full height minus the header
        backgroundColor: '#F9FAFB',
        padding: 4,
        boxSizing: 'border-box',
      }}
    >
      <Typography level="h1" sx={{ fontSize: '6rem', color: TEXT_PRIMARY.PURPLE, m: 0 }}>
        404
      </Typography>
      <Typography level="h2" sx={{ color: TEXT_PRIMARY.BLACK, mt: 2, mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography sx={{ color: TEXT_PRIMARY.GREY, mb: 4, textAlign: 'center' }}>
        Sorry, we couldn't find the page you're looking for.
      </Typography>
      <Button
        component={Link}
        to="/users" // Link back to your main 'users' page
        sx={{
          backgroundColor: TEXT_PRIMARY.PURPLE,
          color: '#FFFFFF',
          ':hover': { backgroundColor: '#7A4CD9' },
        }}
      >
        Go Back Home
      </Button>
    </Box>
  );
};

export default NotFoundPage;