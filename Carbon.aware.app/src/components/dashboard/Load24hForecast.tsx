import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useSimulation } from "@/hooks/useSimulation";

const Load24hForecast = () => {
  const { history } = useSimulation();

  // Use the most recent 24 hourly entries if available; else take last 24 samples
  const recent = history.slice(-24);

  // Map into chart-friendly structure using quantiles if available
  const data = recent.map((h) => ({
    t: h.t,
    q05: (h.q05 || 0) * 1000,
    q50: (h.q50 || 0) * 1000,
    q95: (h.q95 || 0) * 1000,
  }));

  // If not enough points, pad by repeating last value
  if (data.length < 24) {
    const pad = 24 - data.length;
    const last = data[data.length - 1] || { t: "", q05: 0, q50: 0, q95: 0 };
    for (let i = 0; i < pad; i++) data.unshift({ ...last });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
      className="bg-card card-glow rounded-xl p-5 border border-border">
      <h3 className="stat-label mb-4">24-Hour Load Forecast — Uncertainty Cone (Q5/Q50/Q95)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="loadCone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(185, 100%, 50%)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="hsl(185, 100%, 50%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
          <XAxis dataKey="t" tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 9 }} interval="preserveStartEnd" />
          <YAxis tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 10 }} unit="W" />
          <Tooltip formatter={(v: any) => `${Number(v).toFixed(0)} W`} />
          <Legend wrapperStyle={{ fontSize: 10 }} />

          {/* Uncertainty cone: upper and lower areas */}
          <Area type="monotone" dataKey="q95" name="P95" stroke="none" fill="url(#loadCone)" />
          <Area type="monotone" dataKey="q05" name="P05" stroke="none" fill="hsl(220, 20%, 7%)" />

          {/* Median line */}
          <Area type="monotone" dataKey="q50" name="Median (Q50)" stroke="hsl(185, 100%, 50%)" fill="none" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default Load24hForecast;
