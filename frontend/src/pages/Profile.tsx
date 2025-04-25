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
  CircularProgress,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SaveIcon from '@mui/icons-material/Save';
import api from '../api';

interface ProfileData {
  full_name: string;
  email: string;
  currency: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState<ProfileData>({
    full_name: '',
    email: '',
    currency: 'USD',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile/', form);
      alert('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile', err);
      alert('Error updating profile');
    } finally {
      setSaving(false);
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
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                fullWidth
                label="Full Name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Preferred Currency"
                name="currency"
                select
                value={form.currency}
                onChange={handleChange}
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
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Profile;
