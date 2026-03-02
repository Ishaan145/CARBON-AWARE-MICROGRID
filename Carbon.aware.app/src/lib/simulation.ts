/* ─────────────────────────────────────────────
   LIVE ML SIMULATION ENGINE
   Matches ESP32 + FastAPI + ML pipeline
   LSTM load forecast, XGBoost carbon prediction,
   Quantile regression, ACS712 + voltage divider
───────────────────────────────────────────── */

export const SIM = {
  TICK_MS: 3000,
  HIGH_CARBON: 500,
  MIN_SOC: 30,
};

const rnd = (lo: number, hi: number, d = 2) =>
  parseFloat((Math.random() * (hi - lo) + lo).toFixed(d));

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export interface SimSensor {
  solar_voltage: number;
  battery_voltage: number;
  load_current: number;
  load_power: number;
  battery_soc: number;
  active_source: "SOLAR" | "BATTERY" | "GRID";
  device_id: string;
  timestamp: string;
}

export interface SimDecision {
  source: "SOLAR" | "BATTERY" | "GRID";
  relay_solar: boolean;
  relay_battery: boolean;
  relay_grid: boolean;
  predicted_load_kw: number;
  grid_carbon_gco2: number;
  load_lower_bound: number;
  load_median: number;
  load_upper_bound: number;
  carbon_saved_g: number;
  baseline_carbon_g: number;
  decision_reason: string;
  solar_irradiance: number;
  solar_kw: number;
}

export interface SimHistoryEntry {
  t: string;
  hour: number;
  solar_v: number;
  battery_v: number;
  load_w: number;
  load_kw: number;
  soc: number;
  carbon: number;
  q05: number;
  q50: number;
  q95: number;
  carbon_saved: number;
  baseline_carbon: number;
  solar_kw: number;
  cost_inr: number;
  source: "SOLAR" | "BATTERY" | "GRID";
}

export interface SimTick {
  sensor: SimSensor;
  decision: SimDecision;
  histEntry: SimHistoryEntry;
}

// LSTM Load Demand Prediction
function lstmLoadPredict(hour: number, isWeekend: boolean, temp: number) {
  const base = isWeekend ? 1.8 : 2.4;
  const morning = hour >= 8 && hour <= 10 ? 1.8 : 0;
  const afternoon = hour >= 12 && hour <= 15 ? 1.4 : 0;
  const evening = hour >= 17 && hour <= 21 ? 2.2 : 0;
  const night = hour >= 22 || hour <= 5 ? 0.4 : 0;
  const tempFactor = temp > 30 ? 0.5 : temp > 25 ? 0.2 : 0;
  const noise = rnd(-0.15, 0.15);
  const p50 = clamp(
    base + morning + afternoon + evening + night + tempFactor + noise,
    0.3,
    8.0
  );
  return { p05: p50 * 0.82, p50, p95: p50 * 1.18 };
}

// XGBoost Grid Carbon Intensity Prediction
function xgbCarbonPredict(hour: number, dow: number, month: number) {
  const isWeekend = dow >= 5;
  const base = isWeekend ? 365 : 405;
  const morningPeak = hour >= 7 && hour <= 10 ? 75 : 0;
  const eveningPeak = hour >= 17 && hour <= 22 ? 145 : 0;
  const seasonalFactor =
    [380, 370, 360, 350, 355, 340, 330, 335, 345, 360, 375, 385][month] - 360;
  const noise = rnd(-22, 22);
  return clamp(base + morningPeak + eveningPeak + seasonalFactor + noise, 300, 700);
}

// Solar Irradiance Model
function solarIrradiance(hour: number, cloudCover: number) {
  const zenith = Math.max(0, Math.sin((Math.PI * (hour - 6)) / 12));
  return zenith * 980 * (1 - (cloudCover / 100) * 0.75);
}

// Battery SOC Update
function updateSOC(
  prevSOC: number,
  solarKW: number,
  loadKW: number,
  tickS: number
) {
  const capacityKWh = 0.12;
  const netKW = solarKW - loadKW;
  const deltaKWh = (netKW * tickS) / 3600;
  const efficiency = netKW > 0 ? 0.92 : 0.88;
  return clamp(prevSOC + ((deltaKWh * efficiency) / capacityKWh) * 100, 15, 100);
}

const nowStr = () =>
  new Date().toLocaleTimeString("en-IN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export function simTick(
  prev: SimSensor | null,
  weather: { temp: number; cloud: number } | null
): SimTick {
  const now = new Date();
  const hour = now.getHours();
  const dow = now.getDay();
  const month = now.getMonth();
  const isWeekend = dow === 0 || dow === 6;
  const temp = weather?.temp ?? 28;
  const cloud = weather?.cloud ?? 30;

  const irr = solarIrradiance(hour, cloud);
  const solarV =
    irr > 50
      ? clamp((irr / 980) * 18.5 + rnd(-0.3, 0.3), 0, 21.0)
      : rnd(0, 0.6);
  const solarKW = solarV > 10 ? (solarV / 18.5) * 5.2 * (irr / 980) : 0;

  const { p05, p50, p95 } = lstmLoadPredict(hour, isWeekend, temp);
  const loadKW = p50 + rnd(-0.08, 0.08);
  const loadW = loadKW * 1000;

  const newSOC = updateSOC(
    prev?.battery_soc ?? 68,
    solarKW,
    loadKW,
    SIM.TICK_MS / 1000
  );
  const battV = 11.8 + ((newSOC - 20) / 80) * 0.85 + rnd(-0.04, 0.04);
  const loadI = loadW / Math.max(battV, 1);
  const gridCarbon = xgbCarbonPredict(hour, dow, month);

  let source: "SOLAR" | "BATTERY" | "GRID";
  let relaySolar = false,
    relayBatt = false,
    relayGrid = false,
    reason = "";

  if (solarKW >= loadKW * 0.8) {
    source = "SOLAR";
    relaySolar = true;
    reason = `Solar gen ${solarKW.toFixed(2)}kW covers ≥80% of load. Zero-carbon dispatch.`;
  } else if (newSOC > SIM.MIN_SOC && gridCarbon > SIM.HIGH_CARBON) {
    source = "BATTERY";
    relayBatt = true;
    reason = `High grid carbon (${gridCarbon.toFixed(0)} gCO₂/kWh). Battery SOC=${newSOC.toFixed(0)}%.`;
  } else {
    source = "GRID";
    relayGrid = true;
    reason = `Renewable insufficient. Grid carbon=${gridCarbon.toFixed(0)} gCO₂/kWh.`;
  }

  const durationH = SIM.TICK_MS / 1000 / 3600;
  const baselineCarbon = loadKW * durationH * gridCarbon * 1000;
  const actualCarbon = source === "GRID" ? baselineCarbon : 0;
  const carbonSaved = Math.max(0, baselineCarbon - actualCarbon);

  return {
    sensor: {
      solar_voltage: parseFloat(solarV.toFixed(2)),
      battery_voltage: parseFloat(battV.toFixed(2)),
      load_current: parseFloat(loadI.toFixed(2)),
      load_power: parseFloat(loadW.toFixed(1)),
      battery_soc: Math.round(newSOC),
      active_source: source,
      device_id: "ESP32_001",
      timestamp: now.toISOString(),
    },
    decision: {
      source,
      relay_solar: relaySolar,
      relay_battery: relayBatt,
      relay_grid: relayGrid,
      predicted_load_kw: parseFloat(p50.toFixed(4)),
      grid_carbon_gco2: parseFloat(gridCarbon.toFixed(1)),
      load_lower_bound: parseFloat(p05.toFixed(4)),
      load_median: parseFloat(p50.toFixed(4)),
      load_upper_bound: parseFloat(p95.toFixed(4)),
      carbon_saved_g: parseFloat(carbonSaved.toFixed(4)),
      baseline_carbon_g: parseFloat(baselineCarbon.toFixed(4)),
      decision_reason: reason,
      solar_irradiance: Math.round(irr),
      solar_kw: parseFloat(solarKW.toFixed(3)),
    },
    histEntry: {
      t: nowStr(),
      hour,
      solar_v: parseFloat(solarV.toFixed(2)),
      battery_v: parseFloat(battV.toFixed(2)),
      load_w: parseFloat(loadW.toFixed(1)),
      load_kw: parseFloat(loadKW.toFixed(4)),
      soc: Math.round(newSOC),
      carbon: Math.round(gridCarbon),
      q05: parseFloat(p05.toFixed(4)),
      q50: parseFloat(p50.toFixed(4)),
      q95: parseFloat(p95.toFixed(4)),
      carbon_saved: parseFloat(carbonSaved.toFixed(4)),
      baseline_carbon: parseFloat(baselineCarbon.toFixed(4)),
      solar_kw: parseFloat(solarKW.toFixed(3)),
      cost_inr: parseFloat(
        (source === "GRID" ? loadKW * (SIM.TICK_MS / 1000 / 3600) * 7.5 : 0).toFixed(5)
      ),
      source,
    },
  };
}

// Build static carbon heatmap data
export function buildCarbonHeatmap() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.flatMap((day, di) =>
    Array.from({ length: 24 }, (_, h) => {
      const wknd = di >= 5;
      const eve = h >= 18 && h <= 22;
      const morn = h >= 8 && h <= 10;
      return {
        day,
        hour: h,
        value: Math.round(
          (wknd ? 360 : 408) +
            (eve ? 140 : 0) +
            (morn ? 70 : 0) +
            di * 5 +
            Math.sin(h / 3) * 18
        ),
      };
    })
  );
}
