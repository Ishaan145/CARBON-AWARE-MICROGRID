import { motion } from "framer-motion";
import { Cloud, MapPin, Droplets, Wind, Eye, Thermometer, Sun, RefreshCw } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";

const WeatherPanel = () => {
  const { weather } = useSimulation();

  if (!weather) {
    return (
      <div className="bg-card card-glow rounded-xl p-4 border border-border animate-pulse">
        <div className="h-4 bg-muted rounded w-24 mb-3" />
        <div className="h-8 bg-muted rounded w-16" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
      className="bg-card card-glow rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="stat-label flex items-center gap-1.5">
          <Cloud className="w-3.5 h-3.5" /> Weather (Live)
        </h3>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="w-3 h-3" /> {weather.city}, {weather.country}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.description} className="w-12 h-12 -ml-1" />
        <div>
          <p className="text-2xl font-bold font-mono text-foreground">{weather.temp.toFixed(1)}°C</p>
          <p className="text-xs text-muted-foreground capitalize">{weather.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground"><Thermometer className="w-3 h-3" /><span>Feels: {weather.feels_like.toFixed(1)}°C</span></div>
        <div className="flex items-center gap-1.5 text-muted-foreground"><Droplets className="w-3 h-3" /><span>Humidity: {weather.humidity}%</span></div>
        <div className="flex items-center gap-1.5 text-muted-foreground"><Wind className="w-3 h-3" /><span>Wind: {weather.wind_speed} m/s</span></div>
        <div className="flex items-center gap-1.5 text-muted-foreground"><Eye className="w-3 h-3" /><span>Vis: {weather.visibility} km</span></div>
        <div className="flex items-center gap-1.5 text-muted-foreground"><Cloud className="w-3 h-3" /><span>Clouds: {weather.cloud}%</span></div>
        <div className="flex items-center gap-1.5 text-solar"><Sun className="w-3 h-3" /><span className="font-mono">{weather.solar_irradiance_est} W/m²</span></div>
      </div>

      <div className="mt-3 pt-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground">
          Live weather feeds into ML simulation • Solar irradiance model input
        </p>
      </div>
    </motion.div>
  );
};

export default WeatherPanel;
