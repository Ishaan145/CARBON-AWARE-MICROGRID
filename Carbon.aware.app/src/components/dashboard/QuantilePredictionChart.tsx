import { motion } from "framer-motion";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { useSimulation } from "@/hooks/useSimulation";
import { SIM } from "@/lib/simulation";
import Load24hForecast from "./Load24hForecast";

const QuantilePredictionChart = () => {
  const { history } = useSimulation();

  const recentH = history.slice(-40);

  const predictionData = recentH.map((h) => ({
    t: h.t,
    predicted: h.q50 * 1000,
    actual: h.load_w,
    lower: h.q05 * 1000,
    upper: h.q95 * 1000,
  }));

  const carbonData = recentH.map((h) => ({
    t: h.t,
    carbon: h.carbon,
  }));

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card card-glow rounded-xl p-5 border border-border">
        <h3 className="stat-label mb-4">LSTM Load Prediction — 90% Confidence Interval</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={predictionData}>
            <defs>
              <linearGradient id="ciGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(185, 100%, 50%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(185, 100%, 50%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis dataKey="t" tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 9 }} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 10 }} unit="W" />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="upper" name="95th pctile" stroke="none" fill="url(#ciGrad2)" />
            <Area type="monotone" dataKey="lower" name="5th pctile" stroke="none" fill="hsl(220, 20%, 7%)" />
            <Line type="monotone" dataKey="predicted" name="Predicted" stroke="hsl(185, 100%, 50%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="actual" name="Actual" stroke="hsl(45, 100%, 55%)" strokeWidth={2} dot={{ r: 2, fill: "hsl(45, 100%, 55%)" }} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* 24-Hour Forecast - added below the LSTM panel */}
      <Load24hForecast />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-card card-glow rounded-xl p-5 border border-border">
        <h3 className="stat-label mb-4">XGBoost — Grid Carbon Intensity (gCO₂/kWh)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={carbonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis dataKey="t" tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 9 }} interval="preserveStartEnd" />
            <YAxis domain={[250, 750]} tick={{ fill: "hsl(220, 10%, 50%)", fontSize: 10 }} />
            <Tooltip />
            <ReferenceLine y={SIM.HIGH_CARBON} stroke="hsl(0, 70%, 55%)" strokeDasharray="5 5" label={{ value: "HIGH", fill: "hsl(0, 70%, 55%)", fontSize: 9 }} />
            <Line type="monotone" dataKey="carbon" name="Grid CI" stroke="hsl(0, 70%, 55%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default QuantilePredictionChart;
