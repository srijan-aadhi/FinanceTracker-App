import { useEffect, useState } from "react";
import api from "../api";
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface AnnualSpendingDatum {
  year: number;
  total: number; // aggregated absolute spend for that calendar year (positive number)
}

/**
 * Displays a simple bar chart of total spending per calendar year for the
 * currently‑logged‑in user.
 *
 * Backend: expects GET /analytics/annual-spending/ → [{ year: 2023, total: 1234.56 }, ...]
 */
export default function AnnualSpending() {
  const [data, setData] = useState<AnnualSpendingDatum[] | null>(null);

  useEffect(() => {
    api
      .get<AnnualSpendingDatum[]>("/analytics/annual-spending/")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Failed to fetch annual spending data", err);
        setData([]);
      });
  }, []);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Annual Spending
      </Typography>

      {data === null ? (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v:number) => `$${v.toLocaleString()}`} />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}
