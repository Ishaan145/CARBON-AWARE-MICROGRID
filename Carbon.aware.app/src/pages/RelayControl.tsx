import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Sun, Battery, Zap, ToggleLeft, ToggleRight, AlertTriangle, History, Radio, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimulation } from "@/hooks/useSimulation";
import { SIM } from "@/lib/simulation";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";

const RelayControl = () => {
  const {
    sensor, decision, controlMode, setControlMode,
    manualOverride, setManualOverride, commandHistory,
  } = useSimulation();

  const [relaySolar, setRelaySolar] = useState(false);
  const [relayBattery, setRelayBattery] = useState(false);
  const [relayGrid, setRelayGrid] = useState(true);

  const handleSendCommand = (overrides?: { solar: boolean; battery: boolean; grid: boolean; reason: string }) => {
    const cmd = overrides || {
      solar: relaySolar,
      battery: relayBattery,
      grid: relayGrid,
      reason: "Manual override from dashboard",
    };
    setManualOverride({
      active: true,
      relay_solar: cmd.solar,
      relay_battery: cmd.battery,
      relay_grid: cmd.grid,
      reason: cmd.reason,
    });
  };

  const quickPresets = [
    { label: "Solar Only", icon: Sun, solar: true, battery: false, grid: false, color: "text-solar border-solar/30 hover:bg-solar/10" },
    { label: "Battery Only", icon: Battery, solar: false, battery: true, grid: false, color: "text-battery border-battery/30 hover:bg-battery/10" },
    { label: "Grid Only", icon: Zap, solar: false, battery: false, grid: true, color: "text-grid-power border-grid-power/30 hover:bg-grid-power/10" },
    { label: "Solar + Battery", icon: Sun, solar: true, battery: true, grid: false, color: "text-carbon-saved border-carbon-saved/30 hover:bg-carbon-saved/10" },
  ];

  const sourceStyle: Record<string, string> = {
    SOLAR: "text-solar",
    BATTERY: "text-battery",
    GRID: "text-grid-power",
  };

  // Load shifting scheduler state
  const [loads, setLoads] = useState(() => [
    { id: 1, name: "Lab Lights", power: 120, window: "21:00", priority: "LOW", deferred: false },
    { id: 2, name: "AC Unit", power: 1500, window: "14:00", priority: "HIGH", deferred: false },
    { id: 3, name: "Laptop Chargers", power: 200, window: "09:00", priority: "MED", deferred: false },
    { id: 4, name: "Server Room", power: 800, window: "00:00", priority: "CRIT", deferred: false },
    { id: 5, name: "Water Pump", power: 370, window: "06:00", priority: "MED", deferred: false },
    { id: 6, name: "Projector", power: 250, window: "10:00", priority: "LOW", deferred: false },
  ]);

  const toggleDefer = (id: number) => {
    setLoads((prev) => prev.map((l) => (l.id === id ? { ...l, deferred: !l.deferred } : l)));
  };

  const deferredLoad = loads.filter((l) => l.deferred).reduce((s, l) => s + l.power, 0);
  const activeLoad = loads.filter((l) => !l.deferred).reduce((s, l) => s + l.power, 0);
  // Estimate carbon avoided assuming deferral for 1 hour using current predicted grid carbon (gCO2/kWh)
  const estCarbonAvoided = ((deferredLoad / 1000) * (decision.grid_carbon_gco2 || 0));

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return {
      time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
      relative: getRelativeTime(d),
    };
  };

  const getRelativeTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const determineActiveSource = (solar: boolean, battery: boolean, _grid: boolean) => {
    if (solar) return "SOLAR";
    if (battery) return "BATTERY";
    return "GRID";
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <main className="max-w-[1200px] mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Controls */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mode Toggle */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card card-glow rounded-xl p-5 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" /> Relay Control Panel
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setControlMode("auto")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${controlMode === "auto" ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    AUTO
                  </button>
                  <button
                    onClick={() => setControlMode("manual")}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${controlMode === "manual" ? "bg-chart-amber/20 text-chart-amber border border-chart-amber/30" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    MANUAL
                  </button>
                </div>
              </div>

              {controlMode === "auto" && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground flex items-start gap-2">
                  <Radio className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p>In AUTO mode, the ML engine (LSTM + XGBoost) makes switching decisions based on predicted load, grid carbon intensity, battery SOC, and solar availability.</p>
                </div>
              )}

              {controlMode === "manual" && (
                <div className="space-y-4">
                  <div className="bg-chart-amber/5 border border-chart-amber/20 rounded-lg p-3 text-xs text-chart-amber flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Manual mode overrides AI decisions. Ensure battery SOC ({sensor.battery_soc}%) is sufficient before enabling battery relay.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Solar Relay", pin: "GPIO25", state: relaySolar, setState: setRelaySolar, icon: Sun, color: "solar" },
                      { label: "Battery Relay", pin: "GPIO26", state: relayBattery, setState: setRelayBattery, icon: Battery, color: "battery" },
                      { label: "Grid Relay", pin: "GPIO27", state: relayGrid, setState: setRelayGrid, icon: Zap, color: "grid-power" },
                    ].map((r) => (
                      <button
                        key={r.label}
                        onClick={() => r.setState(!r.state)}
                        className={`rounded-xl border p-4 transition-all ${r.state ? `bg-${r.color}/10 border-${r.color}/40` : "bg-secondary/30 border-border"}`}
                      >
                        <r.icon className={`w-6 h-6 mx-auto mb-2 ${r.state ? `text-${r.color}` : "text-muted-foreground"}`} />
                        <p className="text-xs font-mono text-foreground">{r.label}</p>
                        <p className="text-[10px] text-muted-foreground">{r.pin}</p>
                        <div className="mt-2 flex justify-center">
                          {r.state ? <ToggleRight className={`w-6 h-6 text-${r.color}`} /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                        </div>
                        <p className={`text-[10px] font-mono mt-1 ${r.state ? `text-${r.color}` : "text-muted-foreground"}`}>
                          {r.state ? "ON" : "OFF"}
                        </p>
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSendCommand()}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Send Command to ESP32
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Quick Presets */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card card-glow rounded-xl p-5 border border-border">
              <h3 className="stat-label mb-3">Quick Presets (Load Shifting)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {quickPresets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setControlMode("manual");
                      setRelaySolar(p.solar);
                      setRelayBattery(p.battery);
                      setRelayGrid(p.grid);
                      handleSendCommand({ solar: p.solar, battery: p.battery, grid: p.grid, reason: `Preset: ${p.label}` });
                    }}
                    className={`border rounded-xl p-3 text-xs font-mono transition-all ${p.color}`}
                  >
                    <p.icon className="w-5 h-5 mx-auto mb-1.5" />
                    {p.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Load Shifting Scheduler */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="bg-card card-glow rounded-xl p-5 border border-border">
              <h3 className="stat-label mb-3">Load Shifting Scheduler</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {loads.map((l) => (
                  <div key={l.id} className="rounded-lg border border-border p-4 bg-secondary/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-foreground">{l.name}</p>
                        <p className="text-[11px] text-muted-foreground">{l.power} W • {l.window}</p>
                      </div>
                      <div>
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                          l.priority === "CRIT" ? "bg-red-900 text-red-300" : l.priority === "HIGH" ? "bg-amber-900 text-amber-300" : l.priority === "MED" ? "bg-amber-800 text-amber-200" : "bg-emerald-900 text-emerald-300"
                        }`}>{l.priority}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => toggleDefer(l.id)}
                        className={`w-full rounded-lg px-3 py-2 text-xs font-mono transition-all ${l.deferred ? "bg-primary text-primary-foreground" : "bg-secondary/40 text-muted-foreground"}`}
                      >
                        {l.deferred ? "Deferred (Off-Peak)" : "Defer to Off-Peak"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-border pt-3 text-sm grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Deferred Load</p>
                  <p className="text-lg font-mono font-bold text-emerald-400">{deferredLoad} W</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Active Load</p>
                  <p className="text-lg font-mono font-bold text-amber-400">{activeLoad} W</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Est. Carbon Avoided</p>
                  <p className="text-lg font-mono font-bold text-emerald-300">{Math.round(estCarbonAvoided)} g CO₂</p>
                </div>
              </div>
            </motion.div>

            {/* Live Sensor Preview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-card card-glow rounded-xl p-5 border border-border">
              <h3 className="stat-label mb-3">Current Sensor Readings (Live Simulation)</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                {[
                  { label: "Solar V", value: `${sensor.solar_voltage.toFixed(1)}V`, color: "text-solar" },
                  { label: "Battery V", value: `${sensor.battery_voltage.toFixed(2)}V`, color: "text-battery" },
                  { label: "Load", value: `${sensor.load_power.toFixed(1)}W`, color: "text-chart-cyan" },
                  { label: "SOC", value: `${sensor.battery_soc}%`, color: "text-chart-amber" },
                  { label: "Source", value: sensor.active_source, color: sourceStyle[sensor.active_source] || "text-foreground" },
                ].map((s) => (
                  <div key={s.label} className="bg-secondary/40 rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p>
                    <p className={`text-lg font-mono font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Command History */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-card card-glow rounded-xl p-5 border border-border">
              <h3 className="stat-label mb-3 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Command History
              </h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {commandHistory.map((cmd) => {
                  const ts = formatTimestamp(cmd.timestamp);
                  const activeSource = determineActiveSource(cmd.relay_solar, cmd.relay_battery, cmd.relay_grid);
                  return (
                    <div key={cmd.id} className="bg-secondary/30 rounded-lg p-3 border border-border/50 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="font-mono text-foreground">{ts.time}</span>
                          <span className="text-[9px] text-muted-foreground">{ts.date}</span>
                        </div>
                        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${cmd.mode === "AUTO" ? "bg-primary/10 text-primary" : "bg-chart-amber/10 text-chart-amber"}`}>
                          {cmd.mode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className={`font-mono text-[10px] ${sourceStyle[activeSource] || "text-foreground"}`}>{activeSource}</span>
                        {[
                          { label: "S", on: cmd.relay_solar, color: "bg-solar" },
                          { label: "B", on: cmd.relay_battery, color: "bg-battery" },
                          { label: "G", on: cmd.relay_grid, color: "bg-grid-power" },
                        ].map((r) => (
                          <div key={r.label} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${r.on ? r.color : "bg-muted"}`} />
                            <span className="text-[10px] text-muted-foreground font-mono">{r.label}</span>
                          </div>
                        ))}
                      </div>
                      {cmd.reason && <p className="text-[10px] text-muted-foreground mt-1.5">{cmd.reason}</p>}
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[9px] text-muted-foreground/60">{cmd.commanded_by}</p>
                        <p className="text-[9px] text-muted-foreground/60">{ts.relative}</p>
                      </div>
                    </div>
                  );
                })}
                {commandHistory.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-6">No commands yet. Send your first relay command.</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="mt-6 pb-4 text-center">
        <p className="text-[10px] text-muted-foreground font-mono">
          Carbon-Aware Microgrid • Ishaan Saxena (23MC3027) • RGIPT 2026
        </p>
      </footer>
    </div>
  );
};

export default RelayControl;
