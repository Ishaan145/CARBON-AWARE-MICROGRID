import { motion } from "framer-motion";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { useSimulation } from "@/hooks/useSimulation";

const CustomContent = (props: any) => {
  const { x, y, width, height, name, fill } = props;
  if (width < 30 || height < 20) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="hsl(220, 20%, 7%)" strokeWidth={2} rx={4} />
      {width > 60 && height > 35 && (
        <>
          <text x={x + 8} y={y + 18} fill="hsl(220, 20%, 7%)" fontSize={11} fontWeight={600}>{name}</text>
          <text x={x + 8} y={y + 32} fill="hsl(220, 20%, 20%)" fontSize={10} fontFamily="JetBrains Mono">
            {props.display}
          </text>
        </>
      )}
    </g>
  );
};

const EnergyTreemap = () => {
  const { sensor, decision, totalSaved, srcHistory } = useSimulation();

  const totalDec = Math.max(1, Object.values(srcHistory).reduce((a, b) => a + b, 0));
  const gridPct = Math.round(((srcHistory.GRID || 0) / totalDec) * 100);
  const reductPct = totalSaved > 0 ? Math.min(99, Math.round(((srcHistory.SOLAR + srcHistory.BATTERY) / totalDec) * 100)) : 0;

  const treemapData = [
    { name: "Solar", display: `${decision.solar_kw.toFixed(2)} kW`, size: Math.max(12, decision.solar_kw * 20), fill: "hsl(45, 100%, 55%)" },
    { name: "Load", display: `${(sensor.load_power / 1000).toFixed(3)} kW`, size: Math.max(12, sensor.load_power / 100), fill: "hsl(25, 80%, 50%)" },
    { name: "Battery", display: `SOC ${sensor.battery_soc}%`, size: Math.max(8, sensor.battery_soc * 0.6), fill: "hsl(160, 100%, 45%)" },
    { name: "CO₂ Saved", display: `${(totalSaved / 1000).toFixed(3)} kg`, size: Math.max(8, reductPct * 0.7), fill: "hsl(130, 70%, 50%)" },
    { name: "Grid", display: `${gridPct}% use`, size: Math.max(5, gridPct * 0.5), fill: "hsl(0, 70%, 55%)" },
    { name: "Irradiance", display: `${decision.solar_irradiance} W/m²`, size: Math.max(8, decision.solar_irradiance / 90), fill: "hsl(35, 90%, 50%)" },
  ];

  const formatted = [{ name: "Energy", children: treemapData }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-card card-glow rounded-lg p-4 border border-border"
    >
      <h3 className="stat-label mb-3">Energy Allocation Treemap (Live)</h3>
      <ResponsiveContainer width="100%" height={160}>
        <Treemap
          data={formatted}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="hsl(220, 20%, 7%)"
          content={<CustomContent />}
        />
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 text-[10px] flex-wrap">
        {treemapData.map(d => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.fill }} />
            <span className="text-muted-foreground">{d.name}: {d.display}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default EnergyTreemap;
