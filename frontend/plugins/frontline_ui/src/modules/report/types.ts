import { Icon } from '@tabler/icons-react';
import { IUser } from 'ui-modules';

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

export interface ConversationListItem {
  _id: string;
  content: string;
  customerId: string;
  userId: string;
  assignedUserId: string;
  status: string;
  messages: {
    _id: string;
    content: string;
    userId: string;
    customerId: string;
  }[];
  createdAt: string;
  readUsers: {
    _id: string;
    details: {
      avatar: string;
      fullName: string;
      position: string;
    };
  }[];
}

export interface ConversationUserMessageStat {
  user: IUser;
  messageCount: number;
}

export enum ResponsesChartType {
  Table = 'table',
  Bar = 'bar',
  Line = 'line',
  Pie = 'pie',
  Donut = 'donut',
  Radar = 'radar',
}

export interface ResponsesChartTypeOption {
  IconComponent: Icon;
  value: ResponsesChartType;
  label: string;
}
