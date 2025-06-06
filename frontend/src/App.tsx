import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import Profile from './pages/Profile';
import AnnualSpending from './pages/AnnualSpending';
import useTokenWatcher from './hooks/UseTokenWatcher';


type PrivateRouteProps = { children: React.ReactNode };
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};


export default function App() {
  useTokenWatcher();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index               element={<Dashboard />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="budgets"      element={<Budgets />} />
            <Route path="categories"   element={<Categories />} />
            <Route path="profile"      element={<Profile />} />
            <Route path="annual-spending" element={<AnnualSpending />} />
          </Route>

          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}
