export interface ReportMetric {
  count: number;
  percentage: number;
}

export interface ReportSource {
  _id: string;
  name: string;
  count: number;
  percentage: number;
}

export interface CardConfig {
  id: string;
  colSpan: 1 | 2;
}

export interface DroppableAreaProps {
  id: string;
  colSpan: 1 | 2;
  children: React.ReactNode;
}

export interface ReportCardProps {
  title: string;
  value: number | string;
  percentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export interface TagData {
  _id: string;
  name: string;
  count: number;
  percentage: number;
}

export interface SourceData {
  _id: string;
  name: string;
  count: number;
  percentage: number;
}
