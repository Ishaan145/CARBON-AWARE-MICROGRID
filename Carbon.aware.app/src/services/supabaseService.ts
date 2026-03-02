import { supabase } from "@/integrations/supabase/client";

// Fetch latest sensor readings from Supabase
export const fetchSensorReadings = async (limit = 96) => {
  const { data, error } = await supabase
    .from("sensor_readings")
    .select("*")
    .order("timestamp", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data;
};

// Fetch latest AI decisions
export const fetchAIDecisions = async (limit = 20) => {
  const { data, error } = await supabase
    .from("ai_decisions")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};

// Fetch carbon stats
export const fetchCarbonStats = async () => {
  const { data, error } = await supabase
    .from("carbon_stats")
    .select("*")
    .order("date", { ascending: true })
    .limit(7);
  if (error) throw error;
  return data;
};

// Fetch ML model logs
export const fetchMLModelLogs = async () => {
  const { data, error } = await supabase
    .from("ml_model_logs")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(10);
  if (error) throw error;
  return data;
};

// Fetch latest relay command
export const fetchLatestRelayCommand = async () => {
  const { data, error } = await supabase
    .from("relay_commands")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
};

// Send relay command
export const sendRelayCommand = async (command: {
  relay_solar: boolean;
  relay_battery: boolean;
  relay_grid: boolean;
  mode: string;
  reason: string;
}) => {
  const { data, error } = await supabase
    .from("relay_commands")
    .insert({
      ...command,
      commanded_by: "DASHBOARD",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Save weather data
export const saveWeatherData = async (weather: {
  temperature_c: number;
  humidity: number;
  cloud_cover: number;
  wind_speed: number;
  solar_irradiance: number;
  description: string;
  city: string;
  country: string;
}) => {
  const { error } = await supabase.from("weather_data").insert(weather);
  if (error) throw error;
};

// Fetch relay command history
export const fetchRelayHistory = async (limit = 20) => {
  const { data, error } = await supabase
    .from("relay_commands")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
};
