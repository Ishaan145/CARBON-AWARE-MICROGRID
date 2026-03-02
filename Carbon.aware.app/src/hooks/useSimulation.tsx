import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  simTick,
  SIM,
  buildCarbonHeatmap,
  type SimSensor,
  type SimDecision,
  type SimHistoryEntry,
} from "@/lib/simulation";

interface WeatherState {
  temp: number;
  cloud: number;
  humidity: number;
  description: string;
  city: string;
  country: string;
  icon: string;
  wind_speed: number;
  feels_like: number;
  visibility: number;
  solar_irradiance_est: number;
}

interface SourceHistory {
  SOLAR: number;
  BATTERY: number;
  GRID: number;
}

interface ManualOverride {
  active: boolean;
  relay_solar: boolean;
  relay_battery: boolean;
  relay_grid: boolean;
  reason: string;
}

interface SimulationContextValue {
  sensor: SimSensor;
  decision: SimDecision;
  history: SimHistoryEntry[];
  weather: WeatherState | null;
  totalSaved: number;
  totalBaseline: number;
  srcHistory: SourceHistory;
  heatmapData: { day: string; hour: number; value: number }[];
  manualOverride: ManualOverride;
  setManualOverride: (o: ManualOverride) => void;
  controlMode: "auto" | "manual";
  setControlMode: (m: "auto" | "manual") => void;
  commandHistory: CommandEntry[];
}

interface CommandEntry {
  id: string;
  timestamp: string;
  relay_solar: boolean;
  relay_battery: boolean;
  relay_grid: boolean;
  mode: string;
  reason: string;
  commanded_by: string;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

const WEATHER_KEY = "c59ddca9972d763add3d235ec57a811d";
const MAX_HISTORY = 200;

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [sensor, setSensor] = useState<SimSensor>({
    solar_voltage: 0,
    battery_voltage: 12.3,
    load_current: 1.0,
    load_power: 12.3,
    battery_soc: 68,
    active_source: "GRID",
    device_id: "ESP32_001",
    timestamp: new Date().toISOString(),
  });
  const [decision, setDecision] = useState<SimDecision>({
    source: "GRID",
    relay_solar: false,
    relay_battery: false,
    relay_grid: true,
    predicted_load_kw: 2.4,
    grid_carbon_gco2: 420,
    load_lower_bound: 1.97,
    load_median: 2.4,
    load_upper_bound: 2.83,
    carbon_saved_g: 0,
    baseline_carbon_g: 0,
    decision_reason: "Initializing...",
    solar_irradiance: 0,
    solar_kw: 0,
  });
  const [history, setHistory] = useState<SimHistoryEntry[]>([]);
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalBaseline, setTotalBaseline] = useState(0);
  const [srcHistory, setSrcHistory] = useState<SourceHistory>({
    SOLAR: 0,
    BATTERY: 0,
    GRID: 0,
  });
  const [manualOverride, setManualOverride] = useState<ManualOverride>({
    active: false,
    relay_solar: false,
    relay_battery: false,
    relay_grid: false,
    reason: "",
  });
  const [controlMode, setControlMode] = useState<"auto" | "manual">("auto");
  const [commandHistory, setCommandHistory] = useState<CommandEntry[]>([]);

  const heatmapData = useRef(buildCarbonHeatmap());
  const sensorRef = useRef(sensor);
  sensorRef.current = sensor;
  const manualRef = useRef(manualOverride);
  manualRef.current = manualOverride;
  const controlRef = useRef(controlMode);
  controlRef.current = controlMode;

  // Fetch weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const getCoords = (): Promise<{ lat: number; lon: number }> =>
          new Promise((resolve) => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) =>
                  resolve({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                  }),
                () => resolve({ lat: 26.15, lon: 81.8 })
              );
            } else {
              resolve({ lat: 26.15, lon: 81.8 });
            }
          });

        const coords = await getCoords();
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${WEATHER_KEY}&units=metric`
        );
        const data = await res.json();
        const cloudCover = data.clouds?.all || 0;
        const hour = new Date().getHours();
        const isDaytime = hour >= 6 && hour <= 18;
        const solarIrr = isDaytime
          ? Math.max(
              0,
              1000 *
                (1 - cloudCover / 100) *
                Math.sin((Math.PI * (hour - 6)) / 12)
            )
          : 0;

        setWeather({
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          cloud: cloudCover,
          humidity: data.main.humidity,
          wind_speed: data.wind.speed,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          city: data.name,
          country: data.sys.country,
          visibility: (data.visibility || 0) / 1000,
          solar_irradiance_est: Math.round(solarIrr),
        });
      } catch {
        setWeather({
          temp: 28.5,
          feels_like: 31.2,
          cloud: 25,
          humidity: 62,
          wind_speed: 3.2,
          description: "partly cloudy",
          icon: "02d",
          city: "Amethi",
          country: "IN",
          visibility: 8,
          solar_irradiance_est: 750,
        });
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000);
    return () => clearInterval(interval);
  }, []);

  // Simulation tick
  useEffect(() => {
    const tick = () => {
      const weatherInput = weather
        ? { temp: weather.temp, cloud: weather.cloud }
        : null;
      const result = simTick(sensorRef.current, weatherInput);

      // Apply manual override if active
      if (controlRef.current === "manual" && manualRef.current.active) {
        const mo = manualRef.current;
        const overriddenSource = mo.relay_solar
          ? "SOLAR"
          : mo.relay_battery
          ? "BATTERY"
          : "GRID";
        result.sensor.active_source = overriddenSource;
        result.decision.source = overriddenSource;
        result.decision.relay_solar = mo.relay_solar;
        result.decision.relay_battery = mo.relay_battery;
        result.decision.relay_grid = mo.relay_grid;
        result.decision.decision_reason = `MANUAL: ${mo.reason || "User override from dashboard"}`;
        result.histEntry.source = overriddenSource;
      }

      setSensor(result.sensor);
      setDecision(result.decision);
      setHistory((prev) => [...prev.slice(-(MAX_HISTORY - 1)), result.histEntry]);
      setTotalSaved((prev) => prev + result.decision.carbon_saved_g);
      setTotalBaseline((prev) => prev + result.decision.baseline_carbon_g);
      setSrcHistory((prev) => ({
        ...prev,
        [result.decision.source]: (prev[result.decision.source] || 0) + 1,
      }));
    };

    // Run initial tick
    tick();
    const interval = setInterval(tick, SIM.TICK_MS);
    return () => clearInterval(interval);
  }, [weather]);

  const handleSetManualOverride = useCallback((o: ManualOverride) => {
    setManualOverride(o);
    if (o.active) {
      const source = o.relay_solar
        ? "SOLAR"
        : o.relay_battery
        ? "BATTERY"
        : "GRID";
      setCommandHistory((prev) => [
        {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          relay_solar: o.relay_solar,
          relay_battery: o.relay_battery,
          relay_grid: o.relay_grid,
          mode: "MANUAL",
          reason: o.reason || `Manual override: ${source}`,
          commanded_by: "DASHBOARD",
        },
        ...prev.slice(0, 49),
      ]);
    }
  }, []);

  const handleSetControlMode = useCallback(
    (m: "auto" | "manual") => {
      setControlMode(m);
      if (m === "auto") {
        setManualOverride({
          active: false,
          relay_solar: false,
          relay_battery: false,
          relay_grid: false,
          reason: "",
        });
        setCommandHistory((prev) => [
          {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            relay_solar: false,
            relay_battery: false,
            relay_grid: true,
            mode: "AUTO",
            reason: "Returned to AI auto-control",
            commanded_by: "ML_ENGINE",
          },
          ...prev.slice(0, 49),
        ]);
      }
    },
    []
  );

  return (
    <SimulationContext.Provider
      value={{
        sensor,
        decision,
        history,
        weather,
        totalSaved,
        totalBaseline,
        srcHistory,
        heatmapData: heatmapData.current,
        manualOverride,
        setManualOverride: handleSetManualOverride,
        controlMode,
        setControlMode: handleSetControlMode,
        commandHistory,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used within SimulationProvider");
  return ctx;
}
