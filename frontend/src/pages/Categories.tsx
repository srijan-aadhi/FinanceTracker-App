import axios from 'axios';
import { useState, useEffect } from 'react';
import {
  Typography, Paper, List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Chip, Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Grid
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

// ✅ Category Type
type CategoryType = {
  id: number;
  name: string;
  type?: 'expense' | 'income';
  color: string;
};

type Transaction = {
  id: number;
  category: string;
  amount: number;
};

const defaultCategoryNames = ['Food', 'Transportation', 'Utilities', 'Entertainment', 'Income'];

const Categories = () => {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    axios.get<CategoryType[]>('http://localhost:8000/api/categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to fetch categories:', err));

    axios.get<Transaction[]>('http://localhost:8000/api/transactions/')
      .then(res => setTransactions(res.data))
      .catch(err => console.error('Failed to fetch transactions:', err));
  }, []);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Omit<CategoryType, 'id'> & { id: number | null }>({
    id: null,
    name: '',
    type: 'expense',
    color: '#000000'
  });

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCurrentCategory({ ...currentCategory, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setCurrentCategory({ ...currentCategory, [name]: value as 'expense' | 'income' });
  };

  const handleOpen = (category?: CategoryType) => {
    if (category) {
      setCurrentCategory({
        id: category.id,
        name: category.name,
        type: category.type ?? 'expense',
        color: category.color
      });
      setEditMode(true);
    } else {
      setCurrentCategory({ id: null, name: '', type: 'expense', color: '#000000' });
      setEditMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      if (editMode && currentCategory.id !== null) {
        await axios.put(`http://localhost:8000/api/categories/${currentCategory.id}/`, currentCategory);
      } else {
        await axios.post('http://localhost:8000/api/categories/', currentCategory);
      }

      const res = await axios.get<CategoryType[]>('http://localhost:8000/api/categories/');
      setCategories(res.data);
      handleClose();
    } catch (err) {
      console.error("Failed to submit category:", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/categories/${id}/`);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  const calculateTotalForCategory = (categoryName: string, type?: 'expense' | 'income') => {
    const relatedTransactions = transactions.filter(t => t.category === categoryName);
    if (type === 'income') {
      return relatedTransactions.reduce((sum, t) => t.amount > 0 ? sum + t.amount : sum, 0);
    }
    return relatedTransactions.reduce((sum, t) => t.amount < 0 ? sum + Math.abs(t.amount) : sum, 0);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Categories
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Category
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 2 }}>
        <List>
          {categories.map((category) => {
            const isDefault = defaultCategoryNames.includes(category.name);
            const totalAmount = calculateTotalForCategory(category.name, category.type);
            return (
              <ListItem key={category.id} divider sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: category.color,
                    mr: 2
                  }}
                />
                <ListItemText
                  primary={<Typography variant="h6">{category.name}</Typography>}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={category.type ? category.type.charAt(0).toUpperCase() + category.type.slice(1) : ""}
                        size="small"
                        color={category.type === 'income' ? 'success' : category.type === 'expense' ? 'default' : 'warning'}
                      />
                      <Typography variant="body2">
                        {category.type === 'income' ? 'Total Earned' : 'Total Spent'}: ${Math.abs(totalAmount).toFixed(2)}
                      </Typography>
                    </Box>
                  }
                />
                {!isDefault && (
                  <Box sx={{ ml: 'auto' }}>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpen(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(category.id)}>
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
              value={currentCategory.type || ''}
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
              value={currentCategory.color}
              onChange={handleTextChange}
              sx={{ width: '100%' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary">{editMode ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Categories;
