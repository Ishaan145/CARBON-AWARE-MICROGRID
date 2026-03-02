import { motion } from "framer-motion";
import { useSimulation } from "@/hooks/useSimulation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const getBarColor = (value: number): string => {
  const min = 300;
  const max = 700;
  const ratio = Math.max(0, Math.min(1, (value - min) / (max - min)));
  if (ratio < 0.25) return "#10b981"; // green
  if (ratio < 0.45) return "#84cc16"; // lime
  if (ratio < 0.6) return "#eab308"; // yellow
  if (ratio < 0.75) return "#f97316"; // orange
  return "#ef4444"; // red
};

const GridCarbonForecast = () => {
  const { heatmapData, decision } = useSimulation();

  // Get today's forecast (Mon is index 0 in the heatmap)
  const now = new Date();
  const dayIndex = now.getDay(); // 0=Sun, 1=Mon, etc.
  const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];

  // Extract today's 24h carbon forecast
  const carbonForecast = Array.from({ length: 24 }, (_, hour) => {
    const cell = heatmapData.find((d) => d.day === dayName && d.hour === hour);
    return {
      hour: hour.toString().padStart(2, "0") + ":00",
      carbon: cell?.value ?? 400,
    };
  });

  // Find current hour and highlight it
  const currentHour = now.getHours();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card card-glow rounded-lg p-4 border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="stat-label">24h Grid Carbon Intensity Forecast (gCO₂/kWh)</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getBarColor(decision.grid_carbon_gco2) }} />
          <span className="text-sm font-mono text-foreground">
            {decision.grid_carbon_gco2.toFixed(0)} gCO₂/kWh
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={carbonForecast} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 12, fill: "#888" }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            domain={[300, 700]}
            tick={{ fontSize: 12, fill: "#888" }}
            label={{ value: "gCO₂/kWh", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "8px",
              padding: "8px",
            }}
            formatter={(value: number | string | string[]) => {
              const numVal = typeof value === "number" ? value : 0;
              return [`${numVal.toFixed(0)} gCO₂/kWh`, "Carbon"];
            }}
            labelFormatter={(label) => `${label}`}
          />
          <Bar dataKey="carbon" radius={[4, 4, 0, 0]}>
            {carbonForecast.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.carbon)}
                opacity={index === currentHour ? 1 : 0.85}
                stroke={index === currentHour ? "#fff" : "none"}
                strokeWidth={index === currentHour ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend and Current Info */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Current Hour</p>
            <p className="text-sm font-mono text-foreground">
              {currentHour.toString().padStart(2, "0")}:00 — {carbonForecast[currentHour]?.carbon.toFixed(0)} gCO₂/kWh
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase">Recommendation</p>
            <p className="text-sm font-mono">
              {decision.grid_carbon_gco2 > 500 ? (
                <span className="text-red-400">⚠ HIGH — Defer if possible</span>
              ) : decision.grid_carbon_gco2 > 400 ? (
                <span className="text-amber-400">⚡ MEDIUM — Monitor closely</span>
              ) : (
                <span className="text-emerald-400">✓ LOW — Optimal time to run</span>
              )}
            </p>
          </div>
        </div>

        {/* Color Legend */}
        <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
          <span className="text-[10px] text-muted-foreground">300</span>
          {[
            { color: "#10b981", label: "Low" },
            { color: "#84cc16", label: "Moderate" },
            { color: "#eab308", label: "Elevated" },
            { color: "#f97316", label: "High" },
            { color: "#ef4444", label: "Critical" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-[9px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
          <span className="text-[10px] text-muted-foreground">700 gCO₂/kWh</span>
        </div>
      </div>
    </motion.div>
  );
};

export default GridCarbonForecast;
