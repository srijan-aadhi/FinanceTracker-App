import { useState } from 'react';
import { Typography, Paper, Box, Grid, LinearProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Define budget interface
interface Budget {
  id: number;
  category: string;
  budget: number;
  spent: number;
}

// Define budget form state interface
interface BudgetForm {
  category: string;
  budget: string;
  spent: string;
}

// Example budget data
const initialBudgets: Budget[] = [
  { id: 1, category: 'Food', budget: 500, spent: 320 },
  { id: 2, category: 'Transportation', budget: 300, spent: 150 },
  { id: 3, category: 'Entertainment', budget: 200, spent: 210 },
  { id: 4, category: 'Utilities', budget: 350, spent: 300 },
];

const Budgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [open, setOpen] = useState<boolean>(false);
  const [newBudget, setNewBudget] = useState<BudgetForm>({
    category: '',
    budget: '',
    spent: '0'
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setNewBudget({ ...newBudget, [name]: value });
  };

  const handleSubmit = () => {
    const budget: Budget = {
      id: budgets.length + 1,
      category: newBudget.category,
      budget: parseFloat(newBudget.budget),
      spent: parseFloat(newBudget.spent)
    };
    
    setBudgets([...budgets, budget]);
    setNewBudget({ category: '', budget: '', spent: '0' });
    handleClose();
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Budgets
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Create Budget
        </Button>
      </Box>

      <Grid container spacing={3}>
        {budgets.map((budget) => {
          const progress = (budget.spent / budget.budget) * 100;
          const isOverBudget = budget.spent > budget.budget;
          
          return (
            // Fix: Changed the Grid item props to properly match Material-UI's expected types
            <Grid item xs={12} md={6} key={budget.id.toString()}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderTop: '5px solid',
                  borderColor: isOverBudget ? 'error.main' : 'primary.main'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6">{budget.category}</Typography>
                  <Typography variant="h6" color={isOverBudget ? 'error' : 'primary'}>
                    ${budget.spent} / ${budget.budget}
                  </Typography>
                </Box>
                
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(progress, 100)} 
                  color={isOverBudget ? "error" : "primary"}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Typography variant="body2" color={isOverBudget ? 'error' : 'text.secondary'}>
                    {isOverBudget ? 'Over budget by $' + (budget.spent - budget.budget).toFixed(2) : 
                      'Remaining: $' + (budget.budget - budget.spent).toFixed(2)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Budget Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Budget</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={newBudget.category}
              onChange={handleChange}
            >
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Transportation">Transportation</MenuItem>
              <MenuItem value="Utilities">Utilities</MenuItem>
              <MenuItem value="Entertainment">Entertainment</MenuItem>
              <MenuItem value="Shopping">Shopping</MenuItem>
              <MenuItem value="Housing">Housing</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="budget"
            label="Budget Amount ($)"
            type="number"
            fullWidth
            value={newBudget.budget}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="spent"
            label="Initial Spent Amount ($)"
            type="number"
            fullWidth
            value={newBudget.spent}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Budgets;