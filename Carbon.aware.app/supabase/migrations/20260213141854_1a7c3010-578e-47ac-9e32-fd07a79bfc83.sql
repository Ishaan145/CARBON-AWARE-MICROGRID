
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: sensor_readings
-- ============================================
CREATE TABLE public.sensor_readings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    device_id VARCHAR(50) DEFAULT 'ESP32_001',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    solar_voltage FLOAT,
    battery_voltage FLOAT,
    load_current FLOAT,
    load_power FLOAT,
    battery_soc INTEGER,
    active_source VARCHAR(20)
);

ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read sensor_readings" ON public.sensor_readings FOR SELECT USING (true);
CREATE POLICY "Allow public insert sensor_readings" ON public.sensor_readings FOR INSERT WITH CHECK (true);

-- ============================================
-- TABLE 2: ai_decisions
-- ============================================
CREATE TABLE public.ai_decisions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    relay_solar BOOLEAN DEFAULT FALSE,
    relay_battery BOOLEAN DEFAULT FALSE,
    relay_grid BOOLEAN DEFAULT FALSE,
    predicted_load_kw FLOAT,
    grid_carbon_gco2 FLOAT,
    load_lower_bound FLOAT,
    load_median FLOAT,
    load_upper_bound FLOAT,
    decision_reason TEXT,
    energy_source VARCHAR(20),
    carbon_saved_g FLOAT DEFAULT 0,
    baseline_carbon_g FLOAT DEFAULT 0,
    sensor_id UUID REFERENCES public.sensor_readings(id)
);

ALTER TABLE public.ai_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read ai_decisions" ON public.ai_decisions FOR SELECT USING (true);
CREATE POLICY "Allow public insert ai_decisions" ON public.ai_decisions FOR INSERT WITH CHECK (true);

-- ============================================
-- TABLE 3: weather_data
-- ============================================
CREATE TABLE public.weather_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    temperature_c FLOAT,
    humidity FLOAT,
    cloud_cover FLOAT,
    wind_speed FLOAT,
    solar_irradiance FLOAT,
    description VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(10)
);

ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read weather_data" ON public.weather_data FOR SELECT USING (true);
CREATE POLICY "Allow public insert weather_data" ON public.weather_data FOR INSERT WITH CHECK (true);

-- ============================================
-- TABLE 4: carbon_stats
-- ============================================
CREATE TABLE public.carbon_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE UNIQUE,
    total_energy_kwh FLOAT DEFAULT 0,
    solar_energy_kwh FLOAT DEFAULT 0,
    battery_energy_kwh FLOAT DEFAULT 0,
    grid_energy_kwh FLOAT DEFAULT 0,
    total_carbon_g FLOAT DEFAULT 0,
    baseline_carbon_g FLOAT DEFAULT 0,
    carbon_saved_g FLOAT DEFAULT 0,
    electricity_cost FLOAT DEFAULT 0,
    cost_saved FLOAT DEFAULT 0,
    renewable_fraction FLOAT DEFAULT 0,
    grid_dependency FLOAT DEFAULT 0
);

ALTER TABLE public.carbon_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read carbon_stats" ON public.carbon_stats FOR SELECT USING (true);
CREATE POLICY "Allow public insert carbon_stats" ON public.carbon_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update carbon_stats" ON public.carbon_stats FOR UPDATE USING (true);

-- ============================================
-- TABLE 5: relay_commands
-- For manual relay control from dashboard
-- ============================================
CREATE TABLE public.relay_commands (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    relay_solar BOOLEAN DEFAULT FALSE,
    relay_battery BOOLEAN DEFAULT FALSE,
    relay_grid BOOLEAN DEFAULT FALSE,
    mode VARCHAR(20) DEFAULT 'AUTO',
    commanded_by VARCHAR(50) DEFAULT 'DASHBOARD',
    reason TEXT
);

ALTER TABLE public.relay_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read relay_commands" ON public.relay_commands FOR SELECT USING (true);
CREATE POLICY "Allow public insert relay_commands" ON public.relay_commands FOR INSERT WITH CHECK (true);

-- ============================================
-- TABLE 6: ml_model_logs
-- ============================================
CREATE TABLE public.ml_model_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    model_name VARCHAR(50),
    mae FLOAT,
    rmse FLOAT,
    accuracy FLOAT,
    version VARCHAR(20)
);

ALTER TABLE public.ml_model_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read ml_model_logs" ON public.ml_model_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert ml_model_logs" ON public.ml_model_logs FOR INSERT WITH CHECK (true);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_sensor_timestamp ON public.sensor_readings(timestamp DESC);
CREATE INDEX idx_decisions_timestamp ON public.ai_decisions(timestamp DESC);
CREATE INDEX idx_weather_timestamp ON public.weather_data(timestamp DESC);
CREATE INDEX idx_carbon_date ON public.carbon_stats(date DESC);
CREATE INDEX idx_relay_commands_timestamp ON public.relay_commands(timestamp DESC);

-- ============================================
-- Enable realtime for key tables
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.relay_commands;
