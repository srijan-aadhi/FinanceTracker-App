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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface AnnualPoint {
  year: number;
  total: number; // absolute spend (positive number)
}

/**
 * Line chart of total annual spending for the current user.
 * Expects backend GET /analytics/annual-spending/ → [{ year, total }, ...]
 */
export default function AnnualSpending() {
  const [data, setData] = useState<AnnualPoint[] | null>(null);

  useEffect(() => {
    api
      .get<AnnualPoint[]>("/analytics/annual-spending/")
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Failed to fetch annual spending", err);
        setData([]);
      });
  }, []);

  return (
    <Paper sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h4" gutterBottom>
        Annual Spending
      </Typography>

      {data === null ? (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : data.length === 0 ? (
        <Typography variant="body2">No data yet.</Typography>
      ) : (
        <Box sx={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip formatter={(v:number) => `$${v.toLocaleString()}`} />
              <Line type="monotone" dataKey="total" dot />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
}
