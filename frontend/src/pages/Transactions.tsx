import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, FormHelperText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface Transaction {
  id: number;
  date: string;
  description?: string;
  category: string;
  amount: number;
}

interface NewTransactionForm {
  date: string;
  description: string;
  category: string;
  amount: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [open, setOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<NewTransactionForm>({
    date: '', description: '', category: '', amount: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    axios.get('http://localhost:8000/api/transactions/')
      .then(res => setTransactions(res.data))
      .catch(err => console.error("Failed to fetch transactions", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ) => {
    const { name, value } = e.target;
    setNewTransaction({ ...newTransaction, [name]: value });
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateDate = (dateStr: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const parsed = new Date(dateStr);
    const isValid = !isNaN(parsed.getTime());
    const isoString = parsed.toISOString().slice(0, 10);

    return isValid && isoString === dateStr;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!newTransaction.date) {
      newErrors.date = 'Date is required';
    } else if (!validateDate(newTransaction.date)) {
      newErrors.date = 'Invalid date format or non-existent date';
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

    try {
      const response = await axios.post('http://localhost:8000/api/transactions/', {
        date: newTransaction.date,
        description: newTransaction.description || '',
        category: newTransaction.category,
        amount: finalAmount,
      });

      setTransactions(prev => [...prev, response.data]);
      setNewTransaction({ date: '', description: '', category: '', amount: '' });
      setOpen(false);
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Transactions</Typography>
        <Button onClick={() => setOpen(true)} variant="contained" startIcon={<AddIcon />}>Add Transaction</Button>
      </Box>

      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Amount ($)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No transactions found.</TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.description || '—'}</TableCell>
                    <TableCell>{t.category || '—'}</TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: t.amount < 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}
                    >
                      {Number(t.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Transaction</DialogTitle>
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
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Transportation">Transportation</MenuItem>
              <MenuItem value="Utilities">Utilities</MenuItem>
              <MenuItem value="Entertainment">Entertainment</MenuItem>
              <MenuItem value="Income">Income</MenuItem>
            </Select>
            {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
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
          <Button onClick={handleSubmit}>Add</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Transactions; 