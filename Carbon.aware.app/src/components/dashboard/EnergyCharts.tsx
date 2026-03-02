import { motion } from "framer-motion";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ComposedChart, Bar
} from "recharts";
import { useSimulation } from "@/hooks/useSimulation";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-mono text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-mono">
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

const EnergyCharts = () => {
  const { history } = useSimulation();

  const recentH = history.slice(-60);

  const voltageData = recentH.map((h) => ({
    t: h.t,
    solar_v: h.solar_v,
    battery_v: h.battery_v,
  }));

  const loadData = recentH.map((h) => ({
    t: h.t,
    load_kw: h.load_kw,
    q05: h.q05,
    q50: h.q50,
    q95: h.q95,
  }));

  const powerData = recentH.map((h) => ({
    t: h.t,
    solar_kw: h.solar_kw,
    load_kw: h.load_kw,
  }));

  const costData = recentH.slice(-20).map((h) => ({
    t: h.t,
    cost_inr: h.cost_inr,
    source: h.source,
  }));

  return (
    <div className="space-y-4">
      {/* Voltage History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card card-glow rounded-xl p-5 border border-border">
        <h3 className="stat-label mb-4">Voltage History — Solar & Battery (V)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={voltageData}>
            <defs>
              <linearGradient id="solarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(45, 100%, 55%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(45, 100%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis dataKey="t" tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 9 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="solar_v" name="Solar V" stroke="hsl(45, 100%, 55%)" fill="url(#solarGrad)" strokeWidth={2} />
            <Line type="monotone" dataKey="battery_v" name="Battery V" stroke="hsl(160, 100%, 45%)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Load + LSTM Quantile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-card card-glow rounded-xl p-5 border border-border">
        <h3 className="stat-label mb-4">Load Demand + LSTM Quantile Uncertainty (kW)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={loadData}>
            <defs>
              <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(185, 100%, 50%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(185, 100%, 50%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis dataKey="t" tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 9 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 10 }} tickFormatter={(v) => `${(v * 1000).toFixed(0)} W`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="q95" name="P95" stroke="none" fill="url(#ciGrad)" />
            <Area type="monotone" dataKey="q05" name="P05" stroke="none" fill="hsl(220, 20%, 7%)" />
            <Line type="monotone" dataKey="q50" name="LSTM P50" stroke="hsl(185, 100%, 50%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="load_kw" name="Actual" stroke="hsl(45, 100%, 55%)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Solar Gen vs Load & Electricity Cost - Side by Side Equal Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solar Gen vs Load */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card card-glow rounded-xl p-5 border border-border">
          <h3 className="stat-label mb-4">Solar Generation vs Load (kW)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={powerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="t" tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 10 }} ticks={[0, 0.65, 1.3, 1.95, 2.6]} domain={[0, 2.6]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Area type="monotone" dataKey="solar_kw" name="Solar kW" stroke="hsl(45, 100%, 55%)" fill="hsl(45, 100%, 55%)" fillOpacity={0.2} strokeWidth={2} />
              <Line type="monotone" dataKey="load_kw" name="Load kW" stroke="hsl(0, 70%, 55%)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Electricity Cost */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-card card-glow rounded-xl p-5 border border-border">
          <h3 className="stat-label mb-4">Electricity Cost (₹/interval)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <ComposedChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
              <XAxis dataKey="t" tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 9 }} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cost_inr" name="Cost ₹" fill="hsl(35, 100%, 55%)" radius={[3, 3, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default EnergyCharts;
