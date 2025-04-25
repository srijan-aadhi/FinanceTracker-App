import { useEffect, useState } from 'react';
import api from '../api';
import { format , parseISO} from 'date-fns';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface Budget {
  id: number;
  category: number;
  amount: number;
  month: string;
}

interface Category {
  id: number;
  name: string;
}

interface BudgetForm {
  category: string;
  amount: string;
  month: string;
}

const Budgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openBudget, setOpenBudget] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BudgetForm>({ category: '', amount: '', month: '' });

  useEffect(() => {
    api.get('/budgets/')
      .then(res => setBudgets(
        res.data.map((b: any) => ({ ...b, amount: Number(b.amount) }))
      ))
      .catch(err => console.error("Failed to fetch budgets", err));

    api.get('/categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Failed to fetch categories", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    // simple MM-YYYY format validation
    if (!/^\d{2}-\d{4}$/.test(form.month)) {
      alert("Please enter month in MM-YYYY format");
      return;
    }

    const selectedCategory = categories.find(cat => cat.name === form.category);
    const [month, year] = form.month.split('-');
    const budgetData = {
      category: selectedCategory?.id,
      amount: parseFloat(form.amount),
      month: `${year}-${month}-01`,
    };

    try {
      if (editingId) {
        const res = await api.put(`/budgets/${editingId}/`, budgetData);
        setBudgets(prev => prev.map(b => b.id === editingId ? res.data : b));
      } else {
        const res = await api.post('/budgets/', budgetData);
        setBudgets(prev => [...prev, res.data]);
      }
      setForm({ category: '', amount: '', month: '' });
      setEditingId(null);
      setOpenBudget(false);
    } catch (err) {
      console.error("Failed to save budget", err);
    }
  };

  const handleEdit = (budget: Budget) => {
    const matchedCategory = categories.find(c => c.id === budget.category)?.name || '';
    const formattedMonth = format(parseISO(budget.month), 'MM-yyyy');
    setForm({
      category: matchedCategory,
      amount: budget.amount.toString(),
      month: formattedMonth
    });
    setEditingId(budget.id);
    setOpenBudget(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/budgets/${id}/`);
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error("Failed to delete budget", err);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Budgets</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setForm({ category: '', amount: '', month: '' });
            setEditingId(null);
            setOpenBudget(true);
          }}
        >
          Add Budget
        </Button>
      </Box>

      <Paper elevation={3} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Month</TableCell>
              <TableCell align="right">Amount ($)</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgets.map(b => {
              const categoryName = categories.find(c => c.id === b.category)?.name || '';
              return (
                <TableRow key={b.id}>
                  <TableCell>{categoryName}</TableCell>
                  <TableCell>{format(parseISO(b.month), 'MM-yyyy')}</TableCell>
                  <TableCell align="right">{Number(b.amount).toFixed(2)}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(b)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(b.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openBudget} onClose={() => setOpenBudget(false)}>
        <DialogTitle>{editingId ? 'Edit Budget' : 'Add New Budget'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={form.category}
              onChange={handleChange}
              label="Category"
            >
              {categories.map(cat => (
                <MenuItem key={cat.id} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            margin="dense"
            name="month"
            label="Month"
            placeholder="MM-YYYY"
            fullWidth
            value={form.month}
            onChange={handleChange}
          />

          <TextField
            margin="dense"
            name="amount"
            label="Amount"
            type="number"
            fullWidth
            value={form.amount}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBudget(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {editingId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Budgets;
