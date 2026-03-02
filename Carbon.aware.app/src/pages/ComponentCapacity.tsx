import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings2, Sun, Battery, Zap, Cpu, Save, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

interface ComponentSpec {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  fields: { key: string; label: string; unit: string; default: number }[];
}

const componentSpecs: ComponentSpec[] = [
  {
    id: "solar",
    label: "Solar Panel",
    icon: Sun,
    color: "solar",
    fields: [
      { key: "solar_watt_peak", label: "Peak Power (Wp)", unit: "Wp", default: 100 },
      { key: "solar_voc", label: "Open Circuit Voltage (Voc)", unit: "V", default: 21.6 },
      { key: "solar_isc", label: "Short Circuit Current (Isc)", unit: "A", default: 6.14 },
      { key: "solar_vmp", label: "Max Power Voltage (Vmp)", unit: "V", default: 17.8 },
      { key: "solar_imp", label: "Max Power Current (Imp)", unit: "A", default: 5.62 },
      { key: "solar_efficiency", label: "Panel Efficiency", unit: "%", default: 18.5 },
    ],
  },
  {
    id: "battery",
    label: "Battery Bank",
    icon: Battery,
    color: "battery",
    fields: [
      { key: "battery_capacity_ah", label: "Capacity", unit: "Ah", default: 42 },
      { key: "battery_voltage_nominal", label: "Nominal Voltage", unit: "V", default: 12 },
      { key: "battery_energy_wh", label: "Energy Capacity", unit: "Wh", default: 504 },
      { key: "battery_type", label: "Chemistry Type", unit: "", default: 0 },
      { key: "battery_dod_max", label: "Max Depth of Discharge", unit: "%", default: 80 },
      { key: "battery_charge_rate", label: "Max Charge Rate", unit: "A", default: 10 },
    ],
  },
  {
    id: "load",
    label: "Load Profile",
    icon: Zap,
    color: "chart-amber",
    fields: [
      { key: "load_max_power", label: "Max Load Power", unit: "W", default: 120 },
      { key: "load_avg_power", label: "Average Load", unit: "W", default: 55 },
      { key: "load_voltage", label: "Load Voltage", unit: "V", default: 12 },
      { key: "load_peak_hours_start", label: "Peak Hours Start", unit: "hr", default: 17 },
      { key: "load_peak_hours_end", label: "Peak Hours End", unit: "hr", default: 21 },
    ],
  },
  {
    id: "controller",
    label: "ESP32 Controller",
    icon: Cpu,
    color: "primary",
    fields: [
      { key: "esp32_model", label: "Board Model", unit: "", default: 0 },
      { key: "relay_count", label: "Relay Channels", unit: "", default: 3 },
      { key: "adc_resolution", label: "ADC Resolution", unit: "bit", default: 12 },
      { key: "sampling_interval", label: "Sampling Interval", unit: "sec", default: 15 },
      { key: "wifi_rssi_min", label: "Min WiFi RSSI", unit: "dBm", default: -70 },
    ],
  },
];

const batteryTypes = ["Lead-Acid", "Li-Ion (LFP)", "Li-Ion (NMC)", "AGM", "Gel"];
const espModels = ["ESP32-WROOM-32", "ESP32-S3", "ESP32-C3", "ESP32-WROVER"];

const ComponentCapacity = () => {
  const [values, setValues] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("microgrid_capacity");
    if (stored) {
      setValues(JSON.parse(stored));
    } else {
      const defaults: Record<string, number> = {};
      componentSpecs.forEach((spec) => {
        spec.fields.forEach((f) => {
          defaults[f.key] = f.default;
        });
      });
      setValues(defaults);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("microgrid_capacity", JSON.stringify(values));
    setSaved(true);
    toast({ title: "Configuration Saved", description: "Component capacities updated. Dashboard will use these values." });
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    const defaults: Record<string, number> = {};
    componentSpecs.forEach((spec) => {
      spec.fields.forEach((f) => {
        defaults[f.key] = f.default;
      });
    });
    setValues(defaults);
    localStorage.removeItem("microgrid_capacity");
    toast({ title: "Reset to Defaults", description: "All component values restored to factory defaults." });
  };

  const updateValue = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: parseFloat(val) || 0 }));
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="max-w-[1200px] mx-auto p-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" /> Component Capacity Configuration
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Configure your hardware specifications. Different projects may have different solar panels, batteries, and load profiles.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset} className="text-xs">
                <RotateCcw className="w-3 h-3 mr-1.5" /> Reset
              </Button>
              <Button size="sm" onClick={handleSave} className="text-xs bg-primary text-primary-foreground">
                <Save className="w-3 h-3 mr-1.5" /> {saved ? "Saved ✓" : "Save Config"}
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {componentSpecs.map((spec, idx) => (
            <motion.div
              key={spec.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card card-glow rounded-xl p-5 border border-border"
            >
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                <spec.icon className={`w-4 h-4 text-${spec.color}`} />
                {spec.label}
              </h3>
              <div className="space-y-3">
                {spec.fields.map((field) => {
                  // Special handling for battery type and ESP model
                  if (field.key === "battery_type") {
                    return (
                      <div key={field.key} className="flex items-center justify-between">
                        <label className="text-xs text-muted-foreground">{field.label}</label>
                        <select
                          value={values[field.key] ?? field.default}
                          onChange={(e) => updateValue(field.key, e.target.value)}
                          className="bg-secondary/60 border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground w-40 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {batteryTypes.map((t, i) => (
                            <option key={t} value={i}>{t}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  if (field.key === "esp32_model") {
                    return (
                      <div key={field.key} className="flex items-center justify-between">
                        <label className="text-xs text-muted-foreground">{field.label}</label>
                        <select
                          value={values[field.key] ?? field.default}
                          onChange={(e) => updateValue(field.key, e.target.value)}
                          className="bg-secondary/60 border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground w-40 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {espModels.map((t, i) => (
                            <option key={t} value={i}>{t}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div key={field.key} className="flex items-center justify-between">
                      <label className="text-xs text-muted-foreground">{field.label}</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={values[field.key] ?? field.default}
                          onChange={(e) => updateValue(field.key, e.target.value)}
                          className="bg-secondary/60 border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground w-24 text-right focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        {field.unit && <span className="text-[10px] text-muted-foreground font-mono w-8">{field.unit}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* System Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 bg-card card-glow rounded-xl p-5 border border-border"
        >
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-chart-cyan" /> System Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: "Solar Capacity", value: `${values.solar_watt_peak || 100}Wp`, color: "text-solar" },
              { label: "Battery Energy", value: `${values.battery_energy_wh || 504}Wh`, color: "text-battery" },
              { label: "Peak Load", value: `${values.load_max_power || 120}W`, color: "text-chart-amber" },
              {
                label: "Autonomy (est.)",
                value: `${((values.battery_energy_wh || 504) * (values.battery_dod_max || 80) / 100 / (values.load_avg_power || 55)).toFixed(1)}h`,
                color: "text-primary",
              },
            ].map((s) => (
              <div key={s.label} className="bg-secondary/40 rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                <p className={`text-xl font-mono font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <footer className="mt-6 pb-4 text-center">
          <p className="text-[10px] text-muted-foreground font-mono">
            Carbon-Aware Microgrid • Ishaan Saxena (23MC3027) • RGIPT 2026
          </p>
        </footer>
      </main>
    </div>
  );
};

export default ComponentCapacity;
