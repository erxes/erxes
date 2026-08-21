import { Document } from 'mongoose';
import { IReportFilters } from '@/reports/@types/reportFilters';

export type IReportChartFilters = Omit<
  IReportFilters,
  'limit' | 'page' | 'groupPropertyValue'
>;

export interface IReportChart {
  name: string;
  chartType: string;
  visualType?: string;
  colSpan?: number;
  filters?: IReportChartFilters;
}

export interface IReportChartDocument extends IReportChart, Document {
  _id: string;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportChartAddArgs {
  name: string;
  chartType: string;
  visualType?: string;
  colSpan?: number;
  filters?: IReportFilters;
}

export interface IReportChartEditArgs {
  _id: string;
  name?: string;
  visualType?: string;
  colSpan?: number;
  filters?: IReportFilters;
}
