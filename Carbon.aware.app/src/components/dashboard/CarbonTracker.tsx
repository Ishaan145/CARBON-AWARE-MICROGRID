import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";

const CarbonTracker = () => {
  const { totalSaved, totalBaseline, srcHistory, decision } = useSimulation();

  const totalDec = Math.max(1, Object.values(srcHistory).reduce((a, b) => a + b, 0));
  const solarPct = Math.round(((srcHistory.SOLAR || 0) / totalDec) * 100);
  const battPct = Math.round(((srcHistory.BATTERY || 0) / totalDec) * 100);
  const gridPct = Math.round(((srcHistory.GRID || 0) / totalDec) * 100);
  const reductionPct = totalBaseline > 0 ? ((totalSaved / totalBaseline) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card card-glow rounded-lg p-6 border border-border h-full flex flex-col"
    >
      <h3 className="stat-label mb-5 flex items-center gap-2.5">
        <Leaf className="w-4 h-4" style={{ color: "hsl(var(--carbon-saved))" }} /> Carbon Impact
      </h3>

      {/* Top Stats Row */}
      <div className="space-y-4 mb-6">
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1.5">CO₂ Saved</p>
          <p className="text-4xl font-bold text-foreground" style={{ color: "hsl(var(--carbon-saved))" }}>{(totalSaved / 1000).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">kg CO₂</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1.5">Reduction</p>
          <p className="text-4xl font-bold text-foreground">{reductionPct.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground font-medium mt-1">vs baseline</p>
        </div>
      </div>

      {/* Grid Carbon Intensity */}
      <div className="mb-6 p-3.5 bg-secondary/50 rounded-lg border border-border/50">
        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-2.5">Grid Carbon Intensity</p>
        <div className="bg-secondary rounded-full h-2 overflow-hidden mb-2">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${Math.max(2, ((decision.grid_carbon_gco2 - 300) / 400) * 100)}%`,
              background: `linear-gradient(90deg, #22c55e, #eab308, #ef4444)`,
            }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">300</span>
          <p className="text-sm font-semibold text-foreground">{decision.grid_carbon_gco2.toFixed(0)} g/kWh</p>
          <span className="text-xs text-muted-foreground">700</span>
        </div>
      </div>

      {/* Energy Source Mix */}
      <div className="mt-auto pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-3">Energy Mix</p>
        <div className="space-y-2.5">
          {[
            { name: "Solar", pct: solarPct, color: "#48a060" },
            { name: "Battery", pct: battPct, color: "#f97316" },
            { name: "Grid", pct: gridPct, color: "#ef4444" },
          ].map((src) => (
            <div key={src.name} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-14 font-medium">{src.name}</span>
              <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${src.pct}%`,
                    backgroundColor: src.color,
                  }}
                />
              </div>
              <span className="text-xs font-semibold text-foreground w-8 text-right">{src.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CarbonTracker;
