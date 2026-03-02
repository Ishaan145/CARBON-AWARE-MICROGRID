export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_decisions: {
        Row: {
          baseline_carbon_g: number | null
          carbon_saved_g: number | null
          decision_reason: string | null
          energy_source: string | null
          grid_carbon_gco2: number | null
          id: string
          load_lower_bound: number | null
          load_median: number | null
          load_upper_bound: number | null
          predicted_load_kw: number | null
          relay_battery: boolean | null
          relay_grid: boolean | null
          relay_solar: boolean | null
          sensor_id: string | null
          timestamp: string | null
        }
        Insert: {
          baseline_carbon_g?: number | null
          carbon_saved_g?: number | null
          decision_reason?: string | null
          energy_source?: string | null
          grid_carbon_gco2?: number | null
          id?: string
          load_lower_bound?: number | null
          load_median?: number | null
          load_upper_bound?: number | null
          predicted_load_kw?: number | null
          relay_battery?: boolean | null
          relay_grid?: boolean | null
          relay_solar?: boolean | null
          sensor_id?: string | null
          timestamp?: string | null
        }
        Update: {
          baseline_carbon_g?: number | null
          carbon_saved_g?: number | null
          decision_reason?: string | null
          energy_source?: string | null
          grid_carbon_gco2?: number | null
          id?: string
          load_lower_bound?: number | null
          load_median?: number | null
          load_upper_bound?: number | null
          predicted_load_kw?: number | null
          relay_battery?: boolean | null
          relay_grid?: boolean | null
          relay_solar?: boolean | null
          sensor_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_decisions_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "sensor_readings"
            referencedColumns: ["id"]
          },
        ]
      }
      carbon_stats: {
        Row: {
          baseline_carbon_g: number | null
          battery_energy_kwh: number | null
          carbon_saved_g: number | null
          cost_saved: number | null
          date: string | null
          electricity_cost: number | null
          grid_dependency: number | null
          grid_energy_kwh: number | null
          id: string
          renewable_fraction: number | null
          solar_energy_kwh: number | null
          total_carbon_g: number | null
          total_energy_kwh: number | null
        }
        Insert: {
          baseline_carbon_g?: number | null
          battery_energy_kwh?: number | null
          carbon_saved_g?: number | null
          cost_saved?: number | null
          date?: string | null
          electricity_cost?: number | null
          grid_dependency?: number | null
          grid_energy_kwh?: number | null
          id?: string
          renewable_fraction?: number | null
          solar_energy_kwh?: number | null
          total_carbon_g?: number | null
          total_energy_kwh?: number | null
        }
        Update: {
          baseline_carbon_g?: number | null
          battery_energy_kwh?: number | null
          carbon_saved_g?: number | null
          cost_saved?: number | null
          date?: string | null
          electricity_cost?: number | null
          grid_dependency?: number | null
          grid_energy_kwh?: number | null
          id?: string
          renewable_fraction?: number | null
          solar_energy_kwh?: number | null
          total_carbon_g?: number | null
          total_energy_kwh?: number | null
        }
        Relationships: []
      }
      ml_model_logs: {
        Row: {
          accuracy: number | null
          id: string
          mae: number | null
          model_name: string | null
          rmse: number | null
          timestamp: string | null
          version: string | null
        }
        Insert: {
          accuracy?: number | null
          id?: string
          mae?: number | null
          model_name?: string | null
          rmse?: number | null
          timestamp?: string | null
          version?: string | null
        }
        Update: {
          accuracy?: number | null
          id?: string
          mae?: number | null
          model_name?: string | null
          rmse?: number | null
          timestamp?: string | null
          version?: string | null
        }
        Relationships: []
      }
      relay_commands: {
        Row: {
          commanded_by: string | null
          id: string
          mode: string | null
          reason: string | null
          relay_battery: boolean | null
          relay_grid: boolean | null
          relay_solar: boolean | null
          timestamp: string | null
        }
        Insert: {
          commanded_by?: string | null
          id?: string
          mode?: string | null
          reason?: string | null
          relay_battery?: boolean | null
          relay_grid?: boolean | null
          relay_solar?: boolean | null
          timestamp?: string | null
        }
        Update: {
          commanded_by?: string | null
          id?: string
          mode?: string | null
          reason?: string | null
          relay_battery?: boolean | null
          relay_grid?: boolean | null
          relay_solar?: boolean | null
          timestamp?: string | null
        }
        Relationships: []
      }
      sensor_readings: {
        Row: {
          active_source: string | null
          battery_soc: number | null
          battery_voltage: number | null
          device_id: string | null
          id: string
          load_current: number | null
          load_power: number | null
          solar_voltage: number | null
          timestamp: string | null
        }
        Insert: {
          active_source?: string | null
          battery_soc?: number | null
          battery_voltage?: number | null
          device_id?: string | null
          id?: string
          load_current?: number | null
          load_power?: number | null
          solar_voltage?: number | null
          timestamp?: string | null
        }
        Update: {
          active_source?: string | null
          battery_soc?: number | null
          battery_voltage?: number | null
          device_id?: string | null
          id?: string
          load_current?: number | null
          load_power?: number | null
          solar_voltage?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          city: string | null
          cloud_cover: number | null
          country: string | null
          description: string | null
          humidity: number | null
          id: string
          solar_irradiance: number | null
          temperature_c: number | null
          timestamp: string | null
          wind_speed: number | null
        }
        Insert: {
          city?: string | null
          cloud_cover?: number | null
          country?: string | null
          description?: string | null
          humidity?: number | null
          id?: string
          solar_irradiance?: number | null
          temperature_c?: number | null
          timestamp?: string | null
          wind_speed?: number | null
        }
        Update: {
          city?: string | null
          cloud_cover?: number | null
          country?: string | null
          description?: string | null
          humidity?: number | null
          id?: string
          solar_irradiance?: number | null
          temperature_c?: number | null
          timestamp?: string | null
          wind_speed?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
