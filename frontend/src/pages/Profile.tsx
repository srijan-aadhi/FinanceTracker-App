import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Typography,
  Paper,
  Box,
  Avatar,
  Button,
  Grid,
  TextField,
  Divider,
  CircularProgress
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SaveIcon from '@mui/icons-material/Save';
import api from '../api';

interface ProfileData {
  full_name: string;
  email: string;
  currency: string;
}

interface PasswordData {
  current: string;
  new: string;
  confirm: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<ProfileData>({
    full_name: '',
    email: '',
    currency: 'USD',
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  const [password, setPassword] = useState<PasswordData>({ current: '', new: '', confirm: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    api
      .get('/profile/')
      .then(res => {
        setProfile(res.data);
        setForm(res.data);
      })
      .catch(err => console.error('Failed to fetch profile', err))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/profile/', form);
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Error updating profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      alert('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await api.post('/users/set_password/', {
        current_password: password.current,
        new_password: password.new,
      });
      alert('Password changed successfully');
      setPassword({ current: '', new: '', confirm: '' });
    } catch (err) {
      console.error('Failed to change password', err);
      alert('Error changing password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>
      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ width: 100, height: 100, mb: 2 }}>
                <AccountCircleIcon sx={{ fontSize: 60 }} />
              </Avatar>
              <Typography variant="h5">{form.full_name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {form.email}
              </Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box component="form" onSubmit={handleProfileSubmit}>
              <TextField
                margin="normal"
                fullWidth
                label="Full Name"
                name="full_name"
                value={form.full_name}
                onChange={handleProfileChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleProfileChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Preferred Currency"
                name="currency"
                select
                value={form.currency}
                onChange={handleProfileChange}
                SelectProps={{ native: true }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </TextField>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{ mt: 3 }}
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
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
                sx={{ mt: 3 }}
                disabled={savingPassword}
              >
                {savingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Profile;
