import { useState, useEffect } from 'react';
import api from '../api';
import {
  Box, Typography, Paper, List, ListItem, ListItemText, IconButton,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

type CategoryType = {
  id: number;
  name: string;
  type?: 'expense' | 'income';
  color: string;
  total_spent?: number;
  total_earned?: number;
};

const defaultCategoryNames = ['Food', 'Transportation', 'Utilities', 'Entertainment', 'Income'];

const Categories = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Omit<CategoryType, 'id'> & { id: number | null }>({
    id: null,
    name: '',
    type: 'expense',
    color: '#000000',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    api.get<CategoryType[]>('/categories/summary/')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to fetch categories:', err));
  };

  const handleOpen = (category?: CategoryType) => {
    if (category) {
      setCurrentCategory({
        id: category.id,
        name: category.name,
        type: category.type ?? 'expense',
        color: category.color,
      });
      setEditMode(true);
    } else {
      setCurrentCategory({ id: null, name: '', type: 'expense', color: '#000000' });
      setEditMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCategory({ ...currentCategory, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setCurrentCategory({ ...currentCategory, [e.target.name]: e.target.value as 'expense' | 'income' });
  };

  const handleSubmit = async () => {
    try {
      if (editMode && currentCategory.id !== null) {
        await api.put(`/categories/${currentCategory.id}/`, currentCategory);
      } else {
        await api.post('/categories/', currentCategory);
      }
      fetchCategories();
      handleClose();
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}/`);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Category
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 2 }}>
        <List>
          {categories.map((category) => {
            const isDefault = defaultCategoryNames.includes(category.name);
            return (
              <ListItem key={category.id} divider>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: category.color,
                    mr: 2,
                  }}
                />
                <ListItemText
                  primary={<Typography variant="h6">{category.name}</Typography>}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={
                          category.type
                            ? category.type.charAt(0).toUpperCase() + category.type.slice(1)
                            : 'Unknown'
                        }
                         
                        size="small"
                        color={category.type === 'income' ? 'success' : 'default'}
                      />
                      <Typography variant="body2">
                        {category.type === 'income'
                          ? `Total Earned: $${category.total_earned?.toFixed(2) ?? '0.00'}`
                          : `Total Spent: $${category.total_spent?.toFixed(2) ?? '0.00'}`}
                      </Typography>
                    </Box>
                  }
                />
                {!isDefault && (
                  <Box sx={{ ml: 'auto' }}>
                    <IconButton onClick={() => handleOpen(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(category.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </ListItem>
            );
          })}
        </List>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Category Name"
            fullWidth
            value={currentCategory.name}
            onChange={handleTextChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel id="type-label">Type</InputLabel>
            <Select
              name="type"
              value={currentCategory.type ?? ''}
              onChange={handleSelectChange}
              labelId="type-label"
              label="Type"
            >
              <MenuItem value="expense">Expense</MenuItem>
              <MenuItem value="income">Income</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>Color</Typography>
            <TextField
              name="color"
              type="color"
              fullWidth
              value={currentCategory.color}
              onChange={handleTextChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{editMode ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Categories;
