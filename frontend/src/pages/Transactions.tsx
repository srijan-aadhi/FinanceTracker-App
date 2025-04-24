import { useEffect, useState } from 'react';
import axios from 'axios';
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

interface Transaction {
  id: number;
  date: string;
  description?: string;
  category: string;
  amount: number;
}

interface Category {
  id: number;
  name: string;
}

interface NewTransactionForm {
  date: string;
  description: string;
  category: string;
  amount: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newTransaction, setNewTransaction] = useState<NewTransactionForm>({
    date: '', description: '', category: '', amount: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    axios.get('http://localhost:8000/api/transactions/')
      .then(res => setTransactions(res.data))
      .catch(err => console.error("Failed to fetch transactions", err));

    axios.get('http://localhost:8000/api/categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Failed to fetch categories", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setNewTransaction({ ...newTransaction, [name]: value });
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const isDateValidFormat = (dateStr: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const isFutureDate = (dateStr: string) => {
    const parsed = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsed > today;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!newTransaction.date) {
      newErrors.date = 'Date is required';
    } else if (!isDateValidFormat(newTransaction.date)) {
      newErrors.date = 'Invalid or non-existent date';
    } else if (isFutureDate(newTransaction.date)) {
      newErrors.date = 'Future dates are not allowed';
    }

    if (!newTransaction.category) newErrors.category = 'Category is required';
    if (!newTransaction.amount || isNaN(Number(newTransaction.amount))) newErrors.amount = 'Valid amount is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const rawAmount = parseFloat(newTransaction.amount);
    const isIncome = newTransaction.category === 'Income';
    const finalAmount = isIncome ? rawAmount : -Math.abs(rawAmount);

    const transactionData = {
      date: newTransaction.date,
      description: newTransaction.description || '',
      category: newTransaction.category,
      amount: finalAmount,
    };

    try {
      if (editingId) {
        const response = await axios.put(`http://localhost:8000/api/transactions/${editingId}/`, transactionData);
        setTransactions(prev => prev.map(t => t.id === editingId ? response.data : t));
      } else {
        const response = await axios.post('http://localhost:8000/api/transactions/', transactionData);
        setTransactions(prev => [...prev, response.data]);
      }
      setNewTransaction({ date: '', description: '', category: '', amount: '' });
      setEditingId(null);
      setOpen(false);
    } catch (error) {
      console.error("Failed to save transaction:", error);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setNewTransaction({
      date: transaction.date,
      description: transaction.description || 'No description',
      category: transaction.category,
      amount: Math.abs(transaction.amount).toString()
    });
    setEditingId(transaction.id);
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8000/api/transactions/${id}/`);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Transactions</Typography>
        <Button onClick={() => setOpen(true)} variant="contained" startIcon={<AddIcon />}>Add Transaction</Button>
      </Box>

      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Amount ($)</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No transactions found.</TableCell>
              </TableRow>
            ) : (
              transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>{t.description || 'No description'}</TableCell>
                  <TableCell>{t.category || ''}</TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: t.amount < 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}
                  >
                    {Number(t.amount).toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleEdit(t)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDelete(t.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editingId ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="date"
            label="Date (YYYY-MM-DD)"
            type="text"
            fullWidth
            placeholder="2025-04-23"
            value={newTransaction.date}
            onChange={handleChange}
            error={!!errors.date}
            helperText={errors.date || 'Format: YYYY-MM-DD'}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            value={newTransaction.description}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense" error={!!errors.category}>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={newTransaction.category}
              onChange={handleChange}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="amount"
            label="Amount"
            type="number"
            fullWidth
            value={newTransaction.amount}
            onChange={handleChange}
            error={!!errors.amount}
            helperText={errors.amount || "Use positive numbers — app will auto-sign for expenses/income"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>{editingId ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Transactions;
