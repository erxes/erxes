import { Document, Schema } from 'mongoose';
import { field } from './utils';

enum IVisibilityType {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

enum IChartFilterType {
  DATE = 'date',
  STRING = 'string',
  NUMBER = 'number'
}

enum IChartType {
  PIE = 'pie',
  BAR = 'bar',
  LINE = 'line'
}

export interface IReport {
  name: string;
  visibility: IVisibilityType;
  memberIds: string[];
  tagIds: string[];
  createdAt: Date;
}

export interface IReportDocument extends IReport, Document {
  _id: string;
}

export interface IChart {
  name: string;
  reportId: string;
  contentType: string;
  template: string;
  order: number;
  chartType: string;
  filterIds: string[];
  defaultFilter: IChartFilter;
}

export interface IChartDocument extends IChart, Document {
  _id: string;
}

export interface IChartFilter {
  fieldName: string;
  filterValue: string;
  filterType: IChartFilterType;
}

export const reportSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Report name', index: true }),
  visibility: field({
    type: IVisibilityType,
    label: 'Report visibility'
  }),
  memberIds: field({ type: [String], label: 'Assigned member ids' }),
  tagIds: field({ type: [String], label: 'Assigned tag ids' }),
  createdAt: field({
    default: Date.now(),
    type: Date,
    label: 'Created at',
    index: true
  })
});

export const chartSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Chart name', index: true }),
  reportId: field({ type: String, label: 'Id of a corresponding report' }),
  contentType: field({ type: String, label: 'Content type' }),
  template: field({
    type: String,
    label: 'Template name coming from plugins config',
    index: true
  }),
  order: field({ type: Number, label: 'Order number' }),
  chartType: field({ type: IChartType, label: 'Chart type' }),
  filterIds: field({ type: [String], label: 'Filters' }),
  defaultFilterId: field({ type: String, label: 'Default filter id' })
});
