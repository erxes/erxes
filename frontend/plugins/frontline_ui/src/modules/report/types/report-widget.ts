import {
  AreaProps,
  BarProps,
  CartesianGridProps,
  PieProps,
  RadarProps,
  TooltipContentProps,
  XAxisProps,
  YAxisProps,
} from 'recharts';
import { ResponsesChartType } from '../types';

export interface IReportFilterOptions {
  date?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  source?: string;
  limit?: number;
  page?: number;
}

export interface IReportChartOptions {
  XAxis?: XAxisProps;
  YAxis?: YAxisProps;
  Area?: [AreaProps];
  Bar?: [BarProps];
  Radar?: [RadarProps];
  Pie?: PieProps;
  CartesianGrid?: CartesianGridProps;
  Legend?: any;
  TooltipContent?: TooltipContentProps<any, any>;
}

export enum ReportWidgetType {
  ConversationOpen = 'conversationOpen',
  ConversationResolved = 'conversationResolved',
  ConversationTags = 'conversationTags',
  ConversationSources = 'conversationSources',
  ConversationResponses = 'conversationResponses',
}

export interface IReportWidget<T extends ReportWidgetType> {
  id: string;
  title: string;
  chartType: ResponsesChartType;
  chartOptions?: IReportChartOptions;
  filterOptions?: IReportFilterOptions;
  colSpan?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
}
