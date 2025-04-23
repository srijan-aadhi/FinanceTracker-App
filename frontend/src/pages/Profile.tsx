import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Typography, Paper, Box, Avatar, Button, Grid, TextField, Divider, Switch, FormControlLabel } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/Save';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    currency: 'USD',
    darkMode: true,
    emailNotifications: true
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, checked } = e.target;
    setProfile({
      ...profile,
      [name]: name === 'darkMode' || name === 'emailNotifications' ? checked : value
    });
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword({
      ...password,
      [name]: value
    });
  };

  const handleProfileSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically send the updated profile to your backend
    console.log('Profile updated:', profile);
    // Show success message or handle accordingly
  };

  const handlePasswordSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically send the password change request to your backend
    console.log('Password change requested');
    // Reset password fields
    setPassword({ current: '', new: '', confirm: '' });
    // Show success message or handle accordingly
  };

  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ width: 100, height: 100, mb: 2 }}>
                <AccountCircleIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h5">{profile.name}</Typography>
              <Typography variant="body2" color="text.secondary">{profile.email}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box component="form" onSubmit={handleProfileSubmit}>
              <TextField
                margin="normal"
                fullWidth
                label="Full Name"
                name="name"
                value={profile.name}
                onChange={handleProfileChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleProfileChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Preferred Currency"
                name="currency"
                select
                value={profile.currency}
                onChange={handleProfileChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </TextField>

              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.darkMode}
                      onChange={handleProfileChange}
                      name="darkMode"
                      color="primary"
                    />
                  }
                  label="Dark Mode"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.emailNotifications}
                      onChange={handleProfileChange}
                      name="emailNotifications"
                      color="primary"
                    />
                  }
                  label="Email Notifications"
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                sx={{ mt: 3 }}
              >
                Save Changes
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Password Change */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <VpnKeyIcon sx={{ mr: 1 }} />
              <Typography variant="h5">Change Password</Typography>
            </Box>

            <Box component="form" onSubmit={handlePasswordSubmit}>
              <TextField
                margin="normal"
                fullWidth
                label="Current Password"
                name="current"
                type="password"
                value={password.current}
                onChange={handlePasswordChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="New Password"
                name="new"
                type="password"
                value={password.new}
                onChange={handlePasswordChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Confirm New Password"
                name="confirm"
                type="password"
                value={password.confirm}
                onChange={handlePasswordChange}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
              >
                Update Password
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Profile;