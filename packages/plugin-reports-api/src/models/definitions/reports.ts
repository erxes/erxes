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
  createdBy: string;

  updatedAt: Date;
  updatedBy: string;

  assignedUserIds: string[];
  assignedDepartmentIds: string[];

  reportTemplateType?: string;
  serviceName?: string;
  charts?: IChartDocument[];
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
  serviceName?: string;

  vizState: string;
  layout: string;
}

export interface IChartEdit {
  layout?: string;
  vizState?: string;
  name?: string;
  type?: string;
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
  assignedUserIds: field({ type: [String], label: 'Assigned member ids' }),
  assignedDepartmentIds: field({
    type: [String],
    label: 'Assigned department ids'
  }),
  tagIds: field({ type: [String], label: 'Assigned tag ids' }),
  createdAt: field({
    default: Date.now(),
    type: Date,
    label: 'Created at',
    index: true
  }),
  createdBy: field({
    type: String,
    label: 'Created by user id',
    index: true
  }),
  updatedAt: field({
    type: Date,
    label: 'Last updated at'
  }),
  updatedBy: field({
    type: String,
    label: 'Last updated by user id'
  })
});

export const chartSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Chart name', index: true }),
  reportId: field({
    type: String,
    label: 'Id of a corresponding report',
    index: true
  }),
  contentType: field({ type: String, label: 'Content type' }),
  serviceName: field({ type: String, label: 'Service name' }),
  layout: field({ type: String, label: 'Report item - layout' }),
  vizState: field({ type: String }),
  templateType: field({
    type: String,
    label: 'Template name coming from plugins config',
    index: true
  }),
  order: field({ type: Number, label: 'Order number' }),
  chartType: field({ type: IChartType, label: 'Chart type' }),
  filter: field({ type: JSON, label: 'Filters' }),
  defaultFilterId: field({ type: String, label: 'Default filter id' })
});
