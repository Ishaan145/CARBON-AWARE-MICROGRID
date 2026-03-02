import { motion } from "framer-motion";
import { useSimulation } from "@/hooks/useSimulation";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);

const getColor = (value: number): string => {
  const min = 300;
  const max = 700;
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  if (ratio < 0.25) return "hsl(160, 80%, 40%)";
  if (ratio < 0.45) return "hsl(100, 60%, 40%)";
  if (ratio < 0.6) return "hsl(45, 90%, 45%)";
  if (ratio < 0.75) return "hsl(25, 90%, 45%)";
  return "hsl(0, 70%, 45%)";
};

const CarbonHeatmap = () => {
  const { heatmapData } = useSimulation();

  // Group by hour for rows
  const grid: number[][] = Array.from({ length: 24 }, (_, h) =>
    days.map((day) => {
      const cell = heatmapData.find((d) => d.day === day && d.hour === h);
      return cell?.value ?? 400;
    })
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card card-glow rounded-lg p-4 border border-border"
    >
      <h3 className="stat-label mb-3">Grid Carbon Intensity Heatmap — 24h × 7 Days (gCO₂/kWh)</h3>
      <div className="overflow-x-auto">
        <div className="min-w-[400px]">
          <div className="flex mb-1">
            <div className="w-12" />
            {days.map(d => (
              <div key={d} className="flex-1 text-center text-[10px] text-muted-foreground font-mono">{d}</div>
            ))}
          </div>
          <div className="space-y-[2px]">
            {grid.map((row, hourIdx) => (
              <div key={hourIdx} className="flex items-center gap-[2px]">
                <div className="w-12 text-[9px] text-muted-foreground font-mono text-right pr-2">
                  {hourIdx % 3 === 0 ? hours[hourIdx] : ""}
                </div>
                {row.map((val, dayIdx) => (
                  <div
                    key={dayIdx}
                    className="flex-1 h-4 heatmap-cell cursor-pointer"
                    style={{ backgroundColor: getColor(val) }}
                    title={`${days[dayIdx]} ${hours[hourIdx]}: ${val} gCO₂/kWh`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-[10px] text-muted-foreground">300</span>
            {["hsl(160, 80%, 40%)", "hsl(100, 60%, 40%)", "hsl(45, 90%, 45%)", "hsl(25, 90%, 45%)", "hsl(0, 70%, 45%)"].map((c, i) => (
              <div key={i} className="w-6 h-3 rounded-sm" style={{ backgroundColor: c }} />
            ))}
            <span className="text-[10px] text-muted-foreground">700 gCO₂/kWh</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CarbonHeatmap;
