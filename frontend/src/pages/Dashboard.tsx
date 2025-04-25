import { useEffect, useState } from 'react';
import api from '../api';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  date: string;
}

const Dashboard = () => {
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [yearlySpending, setYearlySpending] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    api.get('/dashboard/')
      .then(res => {
        setMonthlySpending(res.data.monthlySpending);
        setMonthlyBudget(res.data.monthlyBudget);
        setYearlySpending(res.data.yearlySpending);
        setRecentTransactions(res.data.recentTransactions);
      })
      .catch(err => console.error("Failed to fetch dashboard data", err));

    api.get('/me/')
      .then(res => setUsername(res.data.username || res.data.email))
      .catch(err => console.error("Failed to fetch user info", err));
  }, []);

  const getBudgetStatus = () => {
    const percentage = (monthlySpending / monthlyBudget) * 100;
    if (percentage >= 100) {
      return { color: 'error.main', icon: <TrendingDownIcon />, text: 'Over Budget' };
    } else if (percentage >= 80) {
      return { color: 'warning.main', icon: <TrendingDownIcon />, text: 'Approaching Limit' };
    } else {
      return { color: 'success.main', icon: <TrendingUpIcon />, text: 'Within Budget' };
    }
  };

  const budgetStatus = getBudgetStatus();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Welcome{username ? `, ${username}` : ''}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Monthly Spending
                    </Typography>
                    <Typography variant="h5">
                      ${monthlySpending.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Monthly Budget
                    </Typography>
                    <Typography variant="h5">
                      ${monthlyBudget.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: budgetStatus.color }}>
              {budgetStatus.icon}
              <Typography sx={{ ml: 1 }}>{budgetStatus.text}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Yearly Overview
            </Typography>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Yearly Spending
                </Typography>
                <Typography variant="h5">
                  ${yearlySpending.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <List>
              {recentTransactions.map((transaction, index) => (
                <Box key={transaction.id}>
                  <ListItem>
                    <ListItemText
                      primary={transaction.description || "Unlabeled"}
                      secondary={new Date(transaction.date + 'T00:00:00').toLocaleDateString()}
                    />
                    <Typography
                      color={transaction.amount >= 0 ? 'success.main' : 'error.main'}
                      variant="body1"
                    >
                      ${Math.abs(transaction.amount).toLocaleString()}
                    </Typography>
                  </ListItem>
                  {index < recentTransactions.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
