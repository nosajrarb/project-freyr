export interface ActivityData {
  date: string;
  intensity: number;
}

export interface HeatmapConfig {
  startDate: string;
  endDate: string;
  data: ActivityData[];
}
