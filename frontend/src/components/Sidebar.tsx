import { Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Budgets', path: '/budgets' },
  { label: 'Categories', path: '/categories' },
  { label: 'Transactions', path: '/transactions' },
  { label: 'Profile', path: '/profile' },
  { label: 'Annual Spending', path: '/annual-spending' }, 
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <Box sx={{ width: 240, bgcolor: '#f5f5f5', height: '100vh', p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Finance Tracker
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {navItems.map((item) => (
          <ListItem disablePadding key={item.path}>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
