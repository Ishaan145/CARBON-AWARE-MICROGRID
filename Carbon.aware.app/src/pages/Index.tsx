import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import SystemOverview from "@/components/dashboard/SystemOverview";
import BatterySOC from "@/components/dashboard/BatterySOC";
import EnergyCharts from "@/components/dashboard/EnergyCharts";
import CarbonTracker from "@/components/dashboard/CarbonTracker";
import CarbonHeatmap from "@/components/dashboard/CarbonHeatmap";
import GridCarbonForecast from "@/components/dashboard/GridCarbonForecast";
import EnergyTreemap from "@/components/dashboard/EnergyTreemap";
import WeatherPanel from "@/components/dashboard/WeatherPanel";
import AIDecisionLog from "@/components/dashboard/AIDecisionLog";
import QuantilePredictionChart from "@/components/dashboard/QuantilePredictionChart";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />

      <main className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Row 1: Top Status Cards - Wide SystemOverview + stacked Weather & Battery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div className="md:col-span-2">
            <SystemOverview />
          </div>

          {/* Right column: Weather on top, Battery below (same section height) */}
          <div className="space-y-3">
            <WeatherPanel />
            <BatterySOC />
          </div>
        </div>

        {/* Row 2: Energy & Load Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
          <EnergyCharts />
          <div className="space-y-4">
            <QuantilePredictionChart />
          </div>
        </div>

        {/* Carbon Tracker moved below the main rows to keep top-row focused */}
        <div className="grid grid-cols-1 mb-4">
          <CarbonTracker />
        </div>

        {/* Row 3: Carbon & Forecast Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
          <GridCarbonForecast />
          <CarbonHeatmap />
          <EnergyTreemap />
        </div>

        {/* Row 4: AI Decision Log (Full Width) */}
        <div className="mb-4">
          <AIDecisionLog />
        </div>

        <footer className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-[11px] text-muted-foreground font-mono tracking-wide">
            Carbon-Aware Microgrid Energy Management System • Ishaan Saxena (23MC3027) • RGIPT Institute 2026
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
