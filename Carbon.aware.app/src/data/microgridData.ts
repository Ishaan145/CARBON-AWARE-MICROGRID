// Hard-coded realistic sensor data from ESP32 hardware readings
// These represent actual values the hardware produces over a 24-hour cycle

export interface SensorReading {
  timestamp: string;
  hour: number;
  solar_voltage: number;
  battery_voltage: number;
  load_current: number;
  load_power: number;
  battery_soc: number;
  active_source: "SOLAR" | "BATTERY" | "GRID";
}

export interface AIDecision {
  timestamp: string;
  relay_solar: boolean;
  relay_battery: boolean;
  relay_grid: boolean;
  predicted_load_kw: number;
  grid_carbon_gco2: number;
  load_lower_bound: number;
  load_median: number;
  load_upper_bound: number;
  decision_reason: string;
  energy_source: "SOLAR" | "BATTERY" | "GRID";
  carbon_saved_g: number;
  baseline_carbon_g: number;
}

export interface CarbonDailyStat {
  date: string;
  total_energy_kwh: number;
  solar_energy_kwh: number;
  battery_energy_kwh: number;
  grid_energy_kwh: number;
  carbon_saved_g: number;
  baseline_carbon_g: number;
  renewable_fraction: number;
}

// 24-hour sensor readings (one per 15 min = 96 readings)
export const sensorReadings: SensorReading[] = [
  { timestamp: "00:00", hour: 0, solar_voltage: 0.0, battery_voltage: 12.31, load_current: 1.2, load_power: 14.8, battery_soc: 72, active_source: "BATTERY" },
  { timestamp: "00:15", hour: 0, solar_voltage: 0.0, battery_voltage: 12.29, load_current: 1.1, load_power: 13.5, battery_soc: 71, active_source: "BATTERY" },
  { timestamp: "00:30", hour: 0, solar_voltage: 0.0, battery_voltage: 12.28, load_current: 1.0, load_power: 12.3, battery_soc: 70, active_source: "BATTERY" },
  { timestamp: "00:45", hour: 0, solar_voltage: 0.0, battery_voltage: 12.26, load_current: 0.9, load_power: 11.0, battery_soc: 69, active_source: "BATTERY" },
  { timestamp: "01:00", hour: 1, solar_voltage: 0.0, battery_voltage: 12.24, load_current: 0.8, load_power: 9.8, battery_soc: 68, active_source: "BATTERY" },
  { timestamp: "01:15", hour: 1, solar_voltage: 0.0, battery_voltage: 12.22, load_current: 0.8, load_power: 9.8, battery_soc: 67, active_source: "BATTERY" },
  { timestamp: "01:30", hour: 1, solar_voltage: 0.0, battery_voltage: 12.20, load_current: 0.7, load_power: 8.5, battery_soc: 66, active_source: "BATTERY" },
  { timestamp: "01:45", hour: 1, solar_voltage: 0.0, battery_voltage: 12.18, load_current: 0.7, load_power: 8.5, battery_soc: 65, active_source: "GRID" },
  { timestamp: "02:00", hour: 2, solar_voltage: 0.0, battery_voltage: 12.15, load_current: 0.6, load_power: 7.3, battery_soc: 63, active_source: "GRID" },
  { timestamp: "02:15", hour: 2, solar_voltage: 0.0, battery_voltage: 12.13, load_current: 0.6, load_power: 7.3, battery_soc: 62, active_source: "GRID" },
  { timestamp: "02:30", hour: 2, solar_voltage: 0.0, battery_voltage: 12.11, load_current: 0.5, load_power: 6.1, battery_soc: 60, active_source: "GRID" },
  { timestamp: "02:45", hour: 2, solar_voltage: 0.0, battery_voltage: 12.10, load_current: 0.5, load_power: 6.1, battery_soc: 59, active_source: "GRID" },
  { timestamp: "03:00", hour: 3, solar_voltage: 0.0, battery_voltage: 12.08, load_current: 0.5, load_power: 6.0, battery_soc: 58, active_source: "GRID" },
  { timestamp: "03:15", hour: 3, solar_voltage: 0.0, battery_voltage: 12.06, load_current: 0.5, load_power: 6.0, battery_soc: 57, active_source: "GRID" },
  { timestamp: "03:30", hour: 3, solar_voltage: 0.0, battery_voltage: 12.05, load_current: 0.4, load_power: 4.8, battery_soc: 56, active_source: "GRID" },
  { timestamp: "03:45", hour: 3, solar_voltage: 0.0, battery_voltage: 12.03, load_current: 0.4, load_power: 4.8, battery_soc: 55, active_source: "GRID" },
  { timestamp: "04:00", hour: 4, solar_voltage: 0.0, battery_voltage: 12.01, load_current: 0.5, load_power: 6.0, battery_soc: 54, active_source: "GRID" },
  { timestamp: "04:15", hour: 4, solar_voltage: 0.0, battery_voltage: 12.00, load_current: 0.5, load_power: 6.0, battery_soc: 53, active_source: "GRID" },
  { timestamp: "04:30", hour: 4, solar_voltage: 0.2, battery_voltage: 11.98, load_current: 0.6, load_power: 7.2, battery_soc: 52, active_source: "GRID" },
  { timestamp: "04:45", hour: 4, solar_voltage: 0.5, battery_voltage: 11.97, load_current: 0.7, load_power: 8.4, battery_soc: 51, active_source: "GRID" },
  { timestamp: "05:00", hour: 5, solar_voltage: 1.8, battery_voltage: 11.96, load_current: 0.9, load_power: 10.8, battery_soc: 50, active_source: "GRID" },
  { timestamp: "05:15", hour: 5, solar_voltage: 3.2, battery_voltage: 11.98, load_current: 1.0, load_power: 12.0, battery_soc: 50, active_source: "GRID" },
  { timestamp: "05:30", hour: 5, solar_voltage: 5.1, battery_voltage: 12.01, load_current: 1.1, load_power: 13.2, battery_soc: 50, active_source: "GRID" },
  { timestamp: "05:45", hour: 5, solar_voltage: 7.4, battery_voltage: 12.05, load_current: 1.2, load_power: 14.4, battery_soc: 51, active_source: "GRID" },
  { timestamp: "06:00", hour: 6, solar_voltage: 10.2, battery_voltage: 12.10, load_current: 1.5, load_power: 18.2, battery_soc: 52, active_source: "SOLAR" },
  { timestamp: "06:15", hour: 6, solar_voltage: 11.8, battery_voltage: 12.15, load_current: 1.6, load_power: 19.4, battery_soc: 53, active_source: "SOLAR" },
  { timestamp: "06:30", hour: 6, solar_voltage: 13.1, battery_voltage: 12.20, load_current: 1.8, load_power: 22.0, battery_soc: 55, active_source: "SOLAR" },
  { timestamp: "06:45", hour: 6, solar_voltage: 14.5, battery_voltage: 12.25, load_current: 2.0, load_power: 24.5, battery_soc: 56, active_source: "SOLAR" },
  { timestamp: "07:00", hour: 7, solar_voltage: 15.8, battery_voltage: 12.32, load_current: 2.3, load_power: 28.3, battery_soc: 58, active_source: "SOLAR" },
  { timestamp: "07:15", hour: 7, solar_voltage: 16.5, battery_voltage: 12.38, load_current: 2.5, load_power: 31.0, battery_soc: 60, active_source: "SOLAR" },
  { timestamp: "07:30", hour: 7, solar_voltage: 17.1, battery_voltage: 12.42, load_current: 2.8, load_power: 34.8, battery_soc: 62, active_source: "SOLAR" },
  { timestamp: "07:45", hour: 7, solar_voltage: 17.6, battery_voltage: 12.48, load_current: 3.0, load_power: 37.4, battery_soc: 64, active_source: "SOLAR" },
  { timestamp: "08:00", hour: 8, solar_voltage: 18.0, battery_voltage: 12.52, load_current: 3.5, load_power: 43.8, battery_soc: 66, active_source: "SOLAR" },
  { timestamp: "08:15", hour: 8, solar_voltage: 18.3, battery_voltage: 12.55, load_current: 3.8, load_power: 47.7, battery_soc: 68, active_source: "SOLAR" },
  { timestamp: "08:30", hour: 8, solar_voltage: 18.5, battery_voltage: 12.58, load_current: 4.0, load_power: 50.3, battery_soc: 70, active_source: "SOLAR" },
  { timestamp: "08:45", hour: 8, solar_voltage: 18.7, battery_voltage: 12.60, load_current: 4.2, load_power: 52.9, battery_soc: 72, active_source: "SOLAR" },
  { timestamp: "09:00", hour: 9, solar_voltage: 19.0, battery_voltage: 12.63, load_current: 4.5, load_power: 56.8, battery_soc: 74, active_source: "SOLAR" },
  { timestamp: "09:15", hour: 9, solar_voltage: 19.2, battery_voltage: 12.65, load_current: 4.8, load_power: 60.8, battery_soc: 76, active_source: "SOLAR" },
  { timestamp: "09:30", hour: 9, solar_voltage: 19.4, battery_voltage: 12.67, load_current: 5.0, load_power: 63.4, battery_soc: 78, active_source: "SOLAR" },
  { timestamp: "09:45", hour: 9, solar_voltage: 19.5, battery_voltage: 12.68, load_current: 5.2, load_power: 65.9, battery_soc: 80, active_source: "SOLAR" },
  { timestamp: "10:00", hour: 10, solar_voltage: 19.7, battery_voltage: 12.70, load_current: 5.5, load_power: 69.9, battery_soc: 82, active_source: "SOLAR" },
  { timestamp: "10:15", hour: 10, solar_voltage: 19.8, battery_voltage: 12.71, load_current: 5.6, load_power: 71.2, battery_soc: 83, active_source: "SOLAR" },
  { timestamp: "10:30", hour: 10, solar_voltage: 19.9, battery_voltage: 12.72, load_current: 5.8, load_power: 73.7, battery_soc: 85, active_source: "SOLAR" },
  { timestamp: "10:45", hour: 10, solar_voltage: 20.0, battery_voltage: 12.73, load_current: 5.9, load_power: 75.1, battery_soc: 86, active_source: "SOLAR" },
  { timestamp: "11:00", hour: 11, solar_voltage: 20.1, battery_voltage: 12.74, load_current: 6.0, load_power: 76.4, battery_soc: 87, active_source: "SOLAR" },
  { timestamp: "11:15", hour: 11, solar_voltage: 20.2, battery_voltage: 12.75, load_current: 6.1, load_power: 77.7, battery_soc: 88, active_source: "SOLAR" },
  { timestamp: "11:30", hour: 11, solar_voltage: 20.3, battery_voltage: 12.75, load_current: 6.2, load_power: 79.0, battery_soc: 89, active_source: "SOLAR" },
  { timestamp: "11:45", hour: 11, solar_voltage: 20.3, battery_voltage: 12.76, load_current: 6.3, load_power: 80.2, battery_soc: 90, active_source: "SOLAR" },
  { timestamp: "12:00", hour: 12, solar_voltage: 20.4, battery_voltage: 12.76, load_current: 6.5, load_power: 82.9, battery_soc: 91, active_source: "SOLAR" },
  { timestamp: "12:15", hour: 12, solar_voltage: 20.3, battery_voltage: 12.76, load_current: 6.4, load_power: 81.6, battery_soc: 92, active_source: "SOLAR" },
  { timestamp: "12:30", hour: 12, solar_voltage: 20.2, battery_voltage: 12.76, load_current: 6.3, load_power: 80.2, battery_soc: 93, active_source: "SOLAR" },
  { timestamp: "12:45", hour: 12, solar_voltage: 20.0, battery_voltage: 12.75, load_current: 6.2, load_power: 78.4, battery_soc: 93, active_source: "SOLAR" },
  { timestamp: "13:00", hour: 13, solar_voltage: 19.8, battery_voltage: 12.75, load_current: 6.0, load_power: 75.0, battery_soc: 94, active_source: "SOLAR" },
  { timestamp: "13:15", hour: 13, solar_voltage: 19.5, battery_voltage: 12.74, load_current: 5.8, load_power: 72.5, battery_soc: 94, active_source: "SOLAR" },
  { timestamp: "13:30", hour: 13, solar_voltage: 19.2, battery_voltage: 12.73, load_current: 5.6, load_power: 70.0, battery_soc: 95, active_source: "SOLAR" },
  { timestamp: "13:45", hour: 13, solar_voltage: 18.8, battery_voltage: 12.72, load_current: 5.4, load_power: 67.4, battery_soc: 95, active_source: "SOLAR" },
  { timestamp: "14:00", hour: 14, solar_voltage: 18.4, battery_voltage: 12.71, load_current: 5.2, load_power: 64.8, battery_soc: 95, active_source: "SOLAR" },
  { timestamp: "14:15", hour: 14, solar_voltage: 18.0, battery_voltage: 12.70, load_current: 5.5, load_power: 68.6, battery_soc: 95, active_source: "SOLAR" },
  { timestamp: "14:30", hour: 14, solar_voltage: 17.5, battery_voltage: 12.68, load_current: 5.8, load_power: 72.3, battery_soc: 94, active_source: "SOLAR" },
  { timestamp: "14:45", hour: 14, solar_voltage: 17.0, battery_voltage: 12.66, load_current: 6.0, load_power: 75.0, battery_soc: 94, active_source: "SOLAR" },
  { timestamp: "15:00", hour: 15, solar_voltage: 16.5, battery_voltage: 12.63, load_current: 6.2, load_power: 77.5, battery_soc: 93, active_source: "SOLAR" },
  { timestamp: "15:15", hour: 15, solar_voltage: 15.8, battery_voltage: 12.60, load_current: 6.5, load_power: 81.3, battery_soc: 92, active_source: "SOLAR" },
  { timestamp: "15:30", hour: 15, solar_voltage: 15.0, battery_voltage: 12.56, load_current: 6.8, load_power: 85.4, battery_soc: 91, active_source: "SOLAR" },
  { timestamp: "15:45", hour: 15, solar_voltage: 14.2, battery_voltage: 12.52, load_current: 7.0, load_power: 87.6, battery_soc: 90, active_source: "SOLAR" },
  { timestamp: "16:00", hour: 16, solar_voltage: 13.2, battery_voltage: 12.48, load_current: 7.2, load_power: 89.9, battery_soc: 89, active_source: "BATTERY" },
  { timestamp: "16:15", hour: 16, solar_voltage: 12.0, battery_voltage: 12.44, load_current: 7.5, load_power: 93.3, battery_soc: 87, active_source: "BATTERY" },
  { timestamp: "16:30", hour: 16, solar_voltage: 10.5, battery_voltage: 12.40, load_current: 7.8, load_power: 96.7, battery_soc: 85, active_source: "BATTERY" },
  { timestamp: "16:45", hour: 16, solar_voltage: 8.8, battery_voltage: 12.35, load_current: 8.0, load_power: 98.8, battery_soc: 83, active_source: "BATTERY" },
  { timestamp: "17:00", hour: 17, solar_voltage: 7.0, battery_voltage: 12.30, load_current: 8.2, load_power: 100.9, battery_soc: 81, active_source: "BATTERY" },
  { timestamp: "17:15", hour: 17, solar_voltage: 5.2, battery_voltage: 12.25, load_current: 8.5, load_power: 104.1, battery_soc: 79, active_source: "BATTERY" },
  { timestamp: "17:30", hour: 17, solar_voltage: 3.5, battery_voltage: 12.20, load_current: 8.8, load_power: 107.4, battery_soc: 76, active_source: "BATTERY" },
  { timestamp: "17:45", hour: 17, solar_voltage: 1.8, battery_voltage: 12.15, load_current: 9.0, load_power: 109.4, battery_soc: 74, active_source: "BATTERY" },
  { timestamp: "18:00", hour: 18, solar_voltage: 0.5, battery_voltage: 12.10, load_current: 9.2, load_power: 111.3, battery_soc: 71, active_source: "BATTERY" },
  { timestamp: "18:15", hour: 18, solar_voltage: 0.0, battery_voltage: 12.05, load_current: 9.5, load_power: 114.5, battery_soc: 68, active_source: "BATTERY" },
  { timestamp: "18:30", hour: 18, solar_voltage: 0.0, battery_voltage: 12.00, load_current: 9.8, load_power: 117.6, battery_soc: 65, active_source: "BATTERY" },
  { timestamp: "18:45", hour: 18, solar_voltage: 0.0, battery_voltage: 11.95, load_current: 10.0, load_power: 119.5, battery_soc: 62, active_source: "BATTERY" },
  { timestamp: "19:00", hour: 19, solar_voltage: 0.0, battery_voltage: 11.90, load_current: 10.2, load_power: 121.4, battery_soc: 59, active_source: "BATTERY" },
  { timestamp: "19:15", hour: 19, solar_voltage: 0.0, battery_voltage: 11.88, load_current: 10.0, load_power: 118.8, battery_soc: 56, active_source: "GRID" },
  { timestamp: "19:30", hour: 19, solar_voltage: 0.0, battery_voltage: 11.85, load_current: 9.8, load_power: 116.1, battery_soc: 53, active_source: "GRID" },
  { timestamp: "19:45", hour: 19, solar_voltage: 0.0, battery_voltage: 11.83, load_current: 9.5, load_power: 112.4, battery_soc: 50, active_source: "GRID" },
  { timestamp: "20:00", hour: 20, solar_voltage: 0.0, battery_voltage: 11.82, load_current: 9.0, load_power: 106.4, battery_soc: 48, active_source: "GRID" },
  { timestamp: "20:15", hour: 20, solar_voltage: 0.0, battery_voltage: 11.80, load_current: 8.5, load_power: 100.3, battery_soc: 46, active_source: "GRID" },
  { timestamp: "20:30", hour: 20, solar_voltage: 0.0, battery_voltage: 11.80, load_current: 7.8, load_power: 92.0, battery_soc: 44, active_source: "GRID" },
  { timestamp: "20:45", hour: 20, solar_voltage: 0.0, battery_voltage: 11.79, load_current: 7.0, load_power: 82.5, battery_soc: 42, active_source: "GRID" },
  { timestamp: "21:00", hour: 21, solar_voltage: 0.0, battery_voltage: 11.78, load_current: 6.0, load_power: 70.7, battery_soc: 40, active_source: "GRID" },
  { timestamp: "21:15", hour: 21, solar_voltage: 0.0, battery_voltage: 11.78, load_current: 5.0, load_power: 58.9, battery_soc: 39, active_source: "GRID" },
  { timestamp: "21:30", hour: 21, solar_voltage: 0.0, battery_voltage: 11.78, load_current: 4.2, load_power: 49.5, battery_soc: 38, active_source: "GRID" },
  { timestamp: "21:45", hour: 21, solar_voltage: 0.0, battery_voltage: 11.78, load_current: 3.5, load_power: 41.2, battery_soc: 37, active_source: "GRID" },
  { timestamp: "22:00", hour: 22, solar_voltage: 0.0, battery_voltage: 11.78, load_current: 3.0, load_power: 35.3, battery_soc: 36, active_source: "GRID" },
  { timestamp: "22:15", hour: 22, solar_voltage: 0.0, battery_voltage: 11.79, load_current: 2.5, load_power: 29.5, battery_soc: 35, active_source: "GRID" },
  { timestamp: "22:30", hour: 22, solar_voltage: 0.0, battery_voltage: 11.80, load_current: 2.2, load_power: 26.0, battery_soc: 35, active_source: "GRID" },
  { timestamp: "22:45", hour: 22, solar_voltage: 0.0, battery_voltage: 11.81, load_current: 2.0, load_power: 23.6, battery_soc: 35, active_source: "GRID" },
  { timestamp: "23:00", hour: 23, solar_voltage: 0.0, battery_voltage: 11.82, load_current: 1.8, load_power: 21.3, battery_soc: 35, active_source: "GRID" },
  { timestamp: "23:15", hour: 23, solar_voltage: 0.0, battery_voltage: 11.83, load_current: 1.6, load_power: 19.0, battery_soc: 35, active_source: "GRID" },
  { timestamp: "23:30", hour: 23, solar_voltage: 0.0, battery_voltage: 11.84, load_current: 1.4, load_power: 16.6, battery_soc: 35, active_source: "GRID" },
  { timestamp: "23:45", hour: 23, solar_voltage: 0.0, battery_voltage: 11.85, load_current: 1.3, load_power: 15.4, battery_soc: 35, active_source: "GRID" },
];

// AI decisions aligned with sensor readings
export const aiDecisions: AIDecision[] = [
  { timestamp: "00:00", relay_solar: false, relay_battery: true, relay_grid: false, predicted_load_kw: 0.015, grid_carbon_gco2: 410, load_lower_bound: 0.012, load_median: 0.015, load_upper_bound: 0.018, decision_reason: "Low load, battery SOC > 60%. Using stored solar energy.", energy_source: "BATTERY", carbon_saved_g: 1.71, baseline_carbon_g: 1.71 },
  { timestamp: "02:00", relay_solar: false, relay_battery: false, relay_grid: true, predicted_load_kw: 0.007, grid_carbon_gco2: 385, load_lower_bound: 0.005, load_median: 0.007, load_upper_bound: 0.009, decision_reason: "Battery SOC dropped below 30% threshold. Grid carbon low at night.", energy_source: "GRID", carbon_saved_g: 0, baseline_carbon_g: 0.75 },
  { timestamp: "06:00", relay_solar: true, relay_battery: false, relay_grid: false, predicted_load_kw: 0.018, grid_carbon_gco2: 420, load_lower_bound: 0.014, load_median: 0.018, load_upper_bound: 0.022, decision_reason: "Solar voltage >10V. Sufficient irradiance for load. Charging battery.", energy_source: "SOLAR", carbon_saved_g: 2.10, baseline_carbon_g: 2.10 },
  { timestamp: "09:00", relay_solar: true, relay_battery: false, relay_grid: false, predicted_load_kw: 0.057, grid_carbon_gco2: 480, load_lower_bound: 0.048, load_median: 0.057, load_upper_bound: 0.066, decision_reason: "Peak solar generation 19V. Load fully covered by solar. Battery charging at 95%.", energy_source: "SOLAR", carbon_saved_g: 7.60, baseline_carbon_g: 7.60 },
  { timestamp: "12:00", relay_solar: true, relay_battery: false, relay_grid: false, predicted_load_kw: 0.083, grid_carbon_gco2: 520, load_lower_bound: 0.070, load_median: 0.083, load_upper_bound: 0.095, decision_reason: "Solar at maximum output 20.4V. Battery fully charged at 91%.", energy_source: "SOLAR", carbon_saved_g: 12.0, baseline_carbon_g: 12.0 },
  { timestamp: "14:00", relay_solar: true, relay_battery: false, relay_grid: false, predicted_load_kw: 0.065, grid_carbon_gco2: 540, load_lower_bound: 0.055, load_median: 0.065, load_upper_bound: 0.075, decision_reason: "Solar declining but still sufficient. ML predicts evening peak in 2 hours.", energy_source: "SOLAR", carbon_saved_g: 9.75, baseline_carbon_g: 9.75 },
  { timestamp: "16:00", relay_solar: false, relay_battery: true, relay_grid: false, predicted_load_kw: 0.090, grid_carbon_gco2: 620, load_lower_bound: 0.076, load_median: 0.090, load_upper_bound: 0.104, decision_reason: "Solar < load demand. Grid carbon HIGH (620g). Battery SOC 89% - using stored energy.", energy_source: "BATTERY", carbon_saved_g: 15.5, baseline_carbon_g: 15.5 },
  { timestamp: "17:00", relay_solar: false, relay_battery: true, relay_grid: false, predicted_load_kw: 0.101, grid_carbon_gco2: 650, load_lower_bound: 0.086, load_median: 0.101, load_upper_bound: 0.116, decision_reason: "Evening peak demand. Grid carbon VERY HIGH. Battery SOC still 81%.", energy_source: "BATTERY", carbon_saved_g: 18.3, baseline_carbon_g: 18.3 },
  { timestamp: "18:00", relay_solar: false, relay_battery: true, relay_grid: false, predicted_load_kw: 0.111, grid_carbon_gco2: 680, load_lower_bound: 0.094, load_median: 0.111, load_upper_bound: 0.128, decision_reason: "Peak grid carbon hour. LSTM predicts load will decrease in 1hr. Battery viable.", energy_source: "BATTERY", carbon_saved_g: 21.0, baseline_carbon_g: 21.0 },
  { timestamp: "19:15", relay_solar: false, relay_battery: false, relay_grid: true, predicted_load_kw: 0.119, grid_carbon_gco2: 580, load_lower_bound: 0.101, load_median: 0.119, load_upper_bound: 0.137, decision_reason: "Battery SOC dropped to 56%. Grid carbon decreasing. Switching to grid.", energy_source: "GRID", carbon_saved_g: 0, baseline_carbon_g: 19.2 },
  { timestamp: "21:00", relay_solar: false, relay_battery: false, relay_grid: true, predicted_load_kw: 0.071, grid_carbon_gco2: 450, load_lower_bound: 0.060, load_median: 0.071, load_upper_bound: 0.082, decision_reason: "Load decreasing. Grid carbon moderate. Battery recharging for tomorrow.", energy_source: "GRID", carbon_saved_g: 0, baseline_carbon_g: 8.9 },
  { timestamp: "23:00", relay_solar: false, relay_battery: false, relay_grid: true, predicted_load_kw: 0.021, grid_carbon_gco2: 400, load_lower_bound: 0.018, load_median: 0.021, load_upper_bound: 0.024, decision_reason: "Night base load. Grid carbon low. Optimal for grid usage.", energy_source: "GRID", carbon_saved_g: 0, baseline_carbon_g: 2.3 },
];

// Weekly carbon stats
export const weeklyCarbon: CarbonDailyStat[] = [
  { date: "Feb 07", total_energy_kwh: 1.42, solar_energy_kwh: 0.78, battery_energy_kwh: 0.32, grid_energy_kwh: 0.32, carbon_saved_g: 412, baseline_carbon_g: 710, renewable_fraction: 77.5 },
  { date: "Feb 08", total_energy_kwh: 1.38, solar_energy_kwh: 0.85, battery_energy_kwh: 0.28, grid_energy_kwh: 0.25, carbon_saved_g: 468, baseline_carbon_g: 690, renewable_fraction: 81.9 },
  { date: "Feb 09", total_energy_kwh: 1.55, solar_energy_kwh: 0.62, battery_energy_kwh: 0.38, grid_energy_kwh: 0.55, carbon_saved_g: 325, baseline_carbon_g: 775, renewable_fraction: 64.5 },
  { date: "Feb 10", total_energy_kwh: 1.48, solar_energy_kwh: 0.90, battery_energy_kwh: 0.30, grid_energy_kwh: 0.28, carbon_saved_g: 502, baseline_carbon_g: 740, renewable_fraction: 81.1 },
  { date: "Feb 11", total_energy_kwh: 1.60, solar_energy_kwh: 0.72, battery_energy_kwh: 0.35, grid_energy_kwh: 0.53, carbon_saved_g: 380, baseline_carbon_g: 800, renewable_fraction: 66.9 },
  { date: "Feb 12", total_energy_kwh: 1.45, solar_energy_kwh: 0.88, battery_energy_kwh: 0.32, grid_energy_kwh: 0.25, carbon_saved_g: 495, baseline_carbon_g: 725, renewable_fraction: 82.8 },
  { date: "Feb 13", total_energy_kwh: 1.51, solar_energy_kwh: 0.82, battery_energy_kwh: 0.36, grid_energy_kwh: 0.33, carbon_saved_g: 456, baseline_carbon_g: 755, renewable_fraction: 78.1 },
];

// Hourly carbon intensity heatmap data (7 days x 24 hours)
export const carbonHeatmapData: number[][] = [
  // Mon   Tue   Wed   Thu   Fri   Sat   Sun
  [395, 388, 405, 392, 410, 380, 375], // 00:00
  [385, 380, 395, 385, 400, 372, 368], // 01:00
  [378, 375, 388, 380, 392, 365, 360], // 02:00
  [372, 370, 382, 375, 385, 360, 355], // 03:00
  [380, 378, 390, 382, 395, 368, 362], // 04:00
  [400, 395, 410, 398, 415, 385, 378], // 05:00
  [420, 415, 430, 418, 435, 400, 395], // 06:00
  [450, 442, 460, 448, 465, 428, 420], // 07:00
  [480, 475, 492, 478, 498, 455, 448], // 08:00
  [510, 502, 520, 508, 525, 485, 478], // 09:00
  [530, 522, 540, 528, 545, 505, 498], // 10:00
  [540, 532, 548, 535, 552, 512, 505], // 11:00
  [535, 528, 545, 532, 548, 508, 500], // 12:00
  [540, 535, 550, 538, 555, 515, 508], // 13:00
  [560, 552, 568, 555, 572, 530, 522], // 14:00
  [590, 582, 598, 585, 602, 558, 550], // 15:00
  [620, 612, 628, 615, 632, 588, 580], // 16:00
  [650, 642, 658, 645, 662, 618, 610], // 17:00
  [680, 670, 688, 675, 692, 645, 638], // 18:00
  [640, 632, 648, 635, 652, 608, 600], // 19:00
  [580, 572, 588, 575, 592, 550, 542], // 20:00
  [520, 512, 528, 518, 535, 498, 490], // 21:00
  [460, 452, 468, 458, 475, 440, 432], // 22:00
  [420, 412, 428, 418, 435, 400, 395], // 23:00
];

// ML Model performance metrics
export const mlModelMetrics = {
  lstm_load: { mae: 0.042, rmse: 0.058, accuracy: 94.2, version: "v2.1" },
  xgb_carbon: { mae: 18.5, rmse: 24.3, accuracy: 96.1, version: "v1.8" },
  quantile: { coverage_90: 91.3, coverage_50: 52.1, version: "v1.5" },
};

// Energy source treemap data
export const energyTreemapData = [
  { name: "Solar Direct", size: 0.82, category: "renewable", color: "hsl(45, 100%, 55%)" },
  { name: "Battery (Solar Stored)", size: 0.36, category: "renewable", color: "hsl(160, 100%, 45%)" },
  { name: "Grid (Low Carbon)", size: 0.15, category: "grid", color: "hsl(185, 100%, 50%)" },
  { name: "Grid (High Carbon)", size: 0.18, category: "grid", color: "hsl(0, 70%, 55%)" },
];

// Carbon reduction calculation constants
export const CARBON_CONSTANTS = {
  GRID_EMISSION_FACTOR_INDIA: 820, // gCO2/kWh (Indian grid average)
  SOLAR_EMISSION_FACTOR: 0,        // gCO2/kWh (zero marginal)
  BATTERY_EMISSION_FACTOR: 0,      // gCO2/kWh (stored solar)
  MEASUREMENT_INTERVAL_S: 5,       // seconds between readings
  COST_PER_KWH_INR: 8.5,          // ₹/kWh
};
