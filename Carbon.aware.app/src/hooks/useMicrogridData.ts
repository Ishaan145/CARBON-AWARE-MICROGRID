import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchSensorReadings,
  fetchAIDecisions,
  fetchCarbonStats,
  fetchMLModelLogs,
  fetchLatestRelayCommand,
  fetchRelayHistory,
} from "@/services/supabaseService";

export const useSensorReadings = () =>
  useQuery({
    queryKey: ["sensor_readings"],
    queryFn: () => fetchSensorReadings(),
    refetchInterval: 10000,
  });

export const useAIDecisions = () =>
  useQuery({
    queryKey: ["ai_decisions"],
    queryFn: () => fetchAIDecisions(),
    refetchInterval: 15000,
  });

export const useCarbonStats = () =>
  useQuery({
    queryKey: ["carbon_stats"],
    queryFn: () => fetchCarbonStats(),
  });

export const useMLModelLogs = () =>
  useQuery({
    queryKey: ["ml_model_logs"],
    queryFn: () => fetchMLModelLogs(),
  });

export const useLatestRelayCommand = () =>
  useQuery({
    queryKey: ["latest_relay_command"],
    queryFn: () => fetchLatestRelayCommand(),
    refetchInterval: 5000,
  });

export const useRelayHistory = () =>
  useQuery({
    queryKey: ["relay_history"],
    queryFn: () => fetchRelayHistory(),
    refetchInterval: 5000,
  });

// Realtime subscription for sensor readings
export const useRealtimeSensors = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("sensor_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sensor_readings" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["sensor_readings"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

// Realtime subscription for relay commands
export const useRealtimeRelays = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("relay_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "relay_commands" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["latest_relay_command"] });
          queryClient.invalidateQueries({ queryKey: ["relay_history"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
