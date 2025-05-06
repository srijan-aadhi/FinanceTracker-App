import { useEffect, useState } from 'react';
import api from '../api';
import {
  Paper, Typography, Box, CircularProgress,
} from '@mui/material';
import {
  ResponsiveContainer,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';


interface RawPoint { year: number; income: number; expense: number; }
interface ChartPoint { year: number; income: number; expense: number; }


function buildYearBaseline(yearsBack = 19): ChartPoint[] {
  const current = new Date().getFullYear();
  return Array.from({ length: yearsBack + 1 }, (_, i) => {
    const y = current - yearsBack + i;
    return { year: y, income: 0, expense: 0 };
  });
}

// choose a nice tick size (100, 500, 1 000, 2 000, 5 000, …)
function getStepSize(max: number): number {
  if (max <= 1000) return 100;
  const mag = 10 ** Math.floor(Math.log10(max)); 
  const scaled = max / mag;
  if (scaled <= 2) return mag / 2;      
  if (scaled <= 5) return mag;          
  return mag * 2;                      
}


export default function AnnualSpending() {
  const [data, setData] = useState<ChartPoint[] | null>(null);

  
  useEffect(() => {
    api.get<RawPoint[]>('/analytics/annual-spending/')
      .then(res => {
        const baseline = buildYearBaseline(19);          
        const merged = baseline.map((pt) => {
          const found = res.data.find(d => d.year === pt.year);
          return found ? { ...pt, ...found } : pt;
        });
        setData(merged);
      })
      .catch(err => {
        console.error('Failed to fetch annual spending', err);
        setData([]);  
      });
  }, []);

  
  if (data === null) {
    return (
      <Paper sx={{ p: 3, minWidth: 800, flexGrow: 1 }}>
        <Typography variant="h4" gutterBottom>Annual Spending vs Income</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  
  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)));
  const step   = getStepSize(maxVal);
  const top    = Math.ceil(maxVal / step) * step || step;
  const ticks  = Array.from({ length: Math.ceil(top / step) + 1 }, (_, i) => i * step);

  return (
    <Paper sx={{ p: 3, minWidth: 800 , flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>Annual Spending vs Income</Typography>

      {data.length === 0 ? (
        <Typography>No data yet.</Typography>
      ) : (
        <Box sx={{ width: '100%', height: 550 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 10, bottom: 0 }}
              barCategoryGap="15%"
              barSize={30}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis
                ticks={ticks}
                domain={[0, top]}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
              />
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="expense" name="Expenses" fill="#f44336" />
              <Bar dataKey="income"  name="Income"  fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}
