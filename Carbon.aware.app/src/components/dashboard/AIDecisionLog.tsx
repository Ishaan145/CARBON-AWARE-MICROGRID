import { motion } from "framer-motion";
import { Brain, ArrowRight } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { SIM } from "@/lib/simulation";

const sourceColors: Record<string, string> = {
  SOLAR: "text-solar bg-solar/10",
  BATTERY: "text-battery bg-battery/10",
  GRID: "text-grid-power bg-grid-power/10",
};

const AIDecisionLog = () => {
  const { history } = useSimulation();

  const mlModels = [
    { name: "LSTM — Load Forecast", mae: "0.087 kW", rmse: "0.124 kW", acc: "92.3%", color: "text-solar" },
    { name: "XGBoost — Carbon Pred.", mae: "18.4 gCO₂", rmse: "26.1 gCO₂", acc: "89.7%", color: "text-primary" },
    { name: "Quantile Reg. (P90)", mae: "—", rmse: "—", acc: "91.2% cov.", color: "text-carbon-saved" },
  ];

  const recent = history.slice().reverse().slice(0, 20);

  return (
    <div className="space-y-4">
      {/* ML Model Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card card-glow rounded-xl p-5 border border-border">
        <h3 className="stat-label mb-3 flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5 text-primary" /> ML Model Performance
        </h3>
        <div className="space-y-2">
          {mlModels.map((m) => (
            <div key={m.name} className="bg-secondary/50 rounded-lg p-2.5">
              <p className={`text-xs font-mono ${m.color} mb-1`}>{m.name}</p>
              <div className="flex gap-3 text-[10px] text-muted-foreground font-mono">
                <span>MAE: {m.mae}</span>
                <span>RMSE: {m.rmse}</span>
                <span className="text-foreground">{m.acc}</span>
              </div>
            </div>
          ))}
          <div className="bg-secondary/30 rounded-lg p-2.5 text-[10px] font-mono text-muted-foreground">
            <p className="text-foreground mb-0.5">OPTIMIZATION · CVXPY</p>
            <p>Min: α×Carbon + β×Cost · α=0.7 β=0.3</p>
          </div>
        </div>
      </motion.div>

      {/* Decision Log Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-card card-glow rounded-xl p-5 border border-border">
        <h3 className="stat-label mb-3">AI Decision Engine — Live Log</h3>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                {["Time", "Source", "CI", "P50 (W)", "Saved (g)", "SOC"].map(h => (
                  <th key={h} className="text-left py-1.5 px-1.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => (
                <tr key={i} className="border-b border-border/30 hover:bg-secondary/20">
                  <td className="py-1.5 px-1.5 text-foreground">{r.t}</td>
                  <td className="py-1.5 px-1.5">
                    <span className={`px-1.5 py-0.5 rounded ${sourceColors[r.source] || "text-muted-foreground"}`}>
                      {r.source}
                    </span>
                  </td>
                  <td className={`py-1.5 px-1.5 ${r.carbon > SIM.HIGH_CARBON ? "text-grid-power" : "text-carbon-saved"}`}>
                    {r.carbon}
                  </td>
                  <td className="py-1.5 px-1.5 text-chart-cyan">{(r.q50 * 1000).toFixed(1)}</td>
                  <td className="py-1.5 px-1.5 text-carbon-saved">
                    {r.carbon_saved > 0 && <ArrowRight className="w-2.5 h-2.5 inline mr-0.5" />}
                    {(r.carbon_saved * 1000).toFixed(3)}
                  </td>
                  <td className="py-1.5 px-1.5 text-chart-amber">{r.soc}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recent.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">Waiting for first simulation tick...</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AIDecisionLog;
