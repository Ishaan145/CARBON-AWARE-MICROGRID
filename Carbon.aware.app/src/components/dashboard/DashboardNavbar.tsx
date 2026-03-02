import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, SlidersHorizontal, Activity, Leaf, Cpu, Settings2 } from "lucide-react";
import logo from "@/assets/auracast.png";
import { useSimulation } from "@/hooks/useSimulation";

const sourceColors: Record<string, string> = {
  SOLAR: "text-solar",
  BATTERY: "text-battery",
  GRID: "text-grid-power",
};

const DashboardNavbar = () => {
  const location = useLocation();
  const { sensor, totalSaved, decision } = useSimulation();

  const links = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/control", label: "Control Panel", icon: SlidersHorizontal },
    { path: "/capacity", label: "Hardware", icon: Settings2 },
  ];

  return (
    <header className="border-b border-border sticky top-0 bg-background/90 backdrop-blur-xl z-50">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src={logo} alt="AuraCast Logo" className="w-9 h-9 rounded-xl object-contain" />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-foreground tracking-tight leading-none">Carbon-Aware Microgrid</h1>
              <p className="text-[9px] text-muted-foreground font-mono mt-0.5">ESP32 • LSTM • XGBoost — RGIPT 2026</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {links.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="pulse-dot bg-primary text-primary" />
            <span className="text-[10px] font-mono text-primary">SIMULATED</span>
          </div>
          <div className={`hidden md:flex items-center gap-1.5 text-[10px] font-mono ${sourceColors[sensor.active_source] || "text-foreground"}`}>
            {sensor.active_source}
          </div>
          <div className="hidden md:flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1"><Leaf className="w-3 h-3 text-carbon-saved" /> ↓{(totalSaved / 1000).toFixed(3)} kg</span>
            <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-chart-cyan" /> {decision.grid_carbon_gco2.toFixed(0)} gCO₂</span>
            <span className="flex items-center gap-1"><Cpu className="w-3 h-3 text-primary" /> ML Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
