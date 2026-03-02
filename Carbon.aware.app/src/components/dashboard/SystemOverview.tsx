import { motion } from "framer-motion";
import { Sun, Battery, Zap, Activity, Cpu, Thermometer, Clock } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { SIM } from "@/lib/simulation";

const sourceColors: Record<string, string> = {
  SOLAR: "text-solar",
  BATTERY: "text-battery",
  GRID: "text-grid-power",
};

const sourceBg: Record<string, string> = {
  SOLAR: "bg-solar/10 border-solar/30",
  BATTERY: "bg-battery/10 border-battery/30",
  GRID: "bg-grid-power/10 border-grid-power/30",
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  subtext?: string;
  delay?: number;
}

const StatCard = ({ icon, label, value, unit, subtext, delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-card card-glow rounded-xl p-4 border border-border"
  >
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="stat-label">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="stat-value text-foreground">{value}</span>
      <span className="text-sm text-muted-foreground">{unit}</span>
    </div>
    {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
  </motion.div>
);

const SystemOverview = () => {
  const { sensor, decision, totalSaved } = useSimulation();
  const source = sensor.active_source;
  const timestamp = new Date(sensor.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="space-y-4">
      {/* Active Source Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-xl border p-4 flex items-center justify-between ${sourceBg[source]}`}
      >
        <div className="flex items-center gap-3">
          <div className={`pulse-dot ${sourceColors[source]}`} style={{ backgroundColor: "currentColor" }} />
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Active Source</p>
            <p className={`text-2xl font-bold font-mono ${sourceColors[source]}`}>{source}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> Live</p>
          <p className="text-sm font-mono text-foreground">{timestamp}</p>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{decision.grid_carbon_gco2.toFixed(0)} gCO₂/kWh</p>
        </div>
      </motion.div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          icon={<Sun className="w-4 h-4 text-solar" />}
          label="Solar Voltage"
          value={sensor.solar_voltage.toFixed(1)}
          unit="V"
          subtext={`${decision.solar_kw.toFixed(2)} kW · ${decision.solar_irradiance} W/m²`}
          delay={0.05}
        />
        <StatCard
          icon={<Battery className="w-4 h-4 text-battery" />}
          label="Battery"
          value={sensor.battery_voltage.toFixed(2)}
          unit="V"
          subtext={`SOC: ${sensor.battery_soc}% ${sensor.battery_soc < SIM.MIN_SOC ? "⚠ LOW" : ""}`}
          delay={0.1}
        />
        <StatCard
          icon={<Zap className="w-4 h-4 text-chart-amber" />}
          label="Load Power"
          value={sensor.load_power.toFixed(1)}
          unit="W"
          subtext={`${sensor.load_current.toFixed(1)}A @ ${sensor.battery_voltage.toFixed(1)}V`}
          delay={0.15}
        />
        <StatCard
          icon={<Activity className="w-4 h-4 text-chart-cyan" />}
          label="Load Current"
          value={sensor.load_current.toFixed(1)}
          unit="A"
          subtext="ACS712-20A sensor"
          delay={0.2}
        />
        <StatCard
          icon={<Cpu className="w-4 h-4 text-primary" />}
          label="ML Prediction"
          value={(decision.predicted_load_kw * 1000).toFixed(0)}
          unit="W"
          subtext={`±${((decision.load_upper_bound - decision.load_lower_bound) * 500).toFixed(0)}W (90% CI)`}
          delay={0.25}
        />
        <StatCard
          icon={<Thermometer className="w-4 h-4 text-chart-rose" />}
          label="Carbon Saved"
          value={(totalSaved / 1000).toFixed(3)}
          unit="kg"
          subtext={`Grid carbon: ${decision.grid_carbon_gco2 > 500 ? "▲ HIGH" : "▼ LOW"}`}
          delay={0.3}
        />
      </div>

      {/* Relay States */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="bg-card card-glow rounded-xl p-4 border border-border"
      >
        <p className="stat-label mb-3">Relay States (ESP32 GPIO)</p>
        <div className="flex gap-4">
          {[
            { label: "Solar", pin: "GPIO25", on: decision.relay_solar, color: "bg-solar" },
            { label: "Battery", pin: "GPIO26", on: decision.relay_battery, color: "bg-battery" },
            { label: "Grid", pin: "GPIO27", on: decision.relay_grid, color: "bg-grid-power" },
          ].map((relay) => (
            <div key={relay.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${relay.on ? relay.color : "bg-muted"} ${relay.on ? "shadow-lg" : ""}`} />
              <div>
                <p className="text-xs font-mono text-foreground">{relay.label}</p>
                <p className="text-[10px] text-muted-foreground">{relay.pin} • {relay.on ? "ON" : "OFF"}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default SystemOverview;
