import { motion } from "framer-motion";
import { Battery, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";

const BatterySOC = () => {
  const { sensor } = useSimulation();

  const soc = sensor.battery_soc;
  const voltage = sensor.battery_voltage;
  const health = 92;
  const cycles = 247;

  // Determine battery status
  const getStatus = () => {
    if (soc < 20) return { text: "Critical", color: "text-red-400", bg: "bg-red-500/10", icon: AlertTriangle };
    if (soc < 40) return { text: "Warning", color: "text-orange-400", bg: "bg-orange-500/10", icon: AlertTriangle };
    if (soc < 60) return { text: "Charging", color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Zap };
    return { text: "Healthy", color: "text-green-400", bg: "bg-green-500/10", icon: CheckCircle2 };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  // Determine bar color
  const getBarColor = () => {
    if (soc < 20) return "#ef4444";
    if (soc < 40) return "#f97316";
    if (soc < 60) return "#eab308";
    return "#22c55e";
  };

  const minVoltage = 11.5;
  const maxVoltage = 13.2;
  const voltagePercent = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card card-glow rounded-xl p-4 border border-border flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="stat-label flex items-center gap-2.5">
          <Battery className="w-4 h-4" style={{ color: "hsl(var(--battery))" }} /> Battery
        </h3>
        <div className={`px-2.5 py-1 rounded-md text-xs font-semibold ${status.bg} ${status.color}`}>
          {status.text}
        </div>
      </div>

      {/* Main SOC Display */}
      <div className="mb-3 flex items-end gap-4">
        <div>
          <p className="text-4xl font-bold text-foreground" style={{ color: "hsl(var(--battery))" }}>{soc}%</p>
          <p className="text-xs text-muted-foreground mt-1 font-medium">State of Charge</p>
        </div>
        <div className="text-right flex-1">
          <p className="text-2xl font-semibold text-foreground">{voltage.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground font-medium">Voltage</p>
        </div>
      </div>

      {/* SOC Progress Bar */}
      <div className="mb-1 bg-secondary rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{
            width: `${soc}%`,
            backgroundColor: getBarColor(),
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground font-medium mb-3">
        <span>20%</span>
        <span>95%</span>
      </div>

      {/* Battery Health Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <div className="bg-secondary/50 rounded-lg p-2 border border-border/50">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Health</p>
          <p className="text-base font-semibold text-foreground">{health}%</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2 border border-border/50">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1">Cycles</p>
          <p className="text-base font-semibold text-foreground">{cycles}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default BatterySOC;
