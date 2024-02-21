import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

enum IVisibilityType {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

enum IChartFilterType {
  DATE = 'date',
  STRING = 'string',
  NUMBER = 'number',
}

enum IChartType {
  PIE = 'pie',
  BAR = 'bar',
  LINE = 'line',
}

export interface IDashboard {
  name: string;
  sectionId: string;

  assignedUserIds: string[];
  assignedDepartmentIds: string[];

  visibility: IVisibilityType;
  memberIds: string[];

  serviceNames?: string[];
  serviceTypes?: string[];
  charts?: IChartDocument[];

  createdAt: Date;
  createdBy: string;

  updatedAt: Date;
  updatedBy: string;
}

export interface IDashboardDocument extends IDashboard, Document {
  _id: string;
}

export interface ISection {
  name: string;
  type: string;

  createdAt: Date;
  createdBy: string;

  updatedAt: Date;
  updatedBy: string;
}

export interface ISectionDocument extends ISection, Document {
  _id: string;
}

export interface IChart {
  name: string;
  dashboardId: string;
  contentType: string;
  templateType: string;
  order: number;
  chartType: string;
  filterIds: string[];
  defaultFilter: IChartFilter;
  serviceName?: string;

  dimension: JSON;

  vizState: string;
  layout: string;
}

export interface IChartEdit {
  layout?: string;
  vizState?: string;
  name?: string;
  type?: string;
}

export interface IChartFilter {
  fieldName: string;
  filterValue: string;
  filterType: IChartFilterType;
}

export interface IChartDocument extends IChart, Document {
  _id: string;
}

export const dashboardSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    sectionId: field({ type: String, label: 'Section id' }),
    visibility: field({
      type: IVisibilityType,
      label: 'Report visibility',
    }),
    assignedUserIds: field({ type: [String], label: 'Assigned member ids' }),
    assignedDepartmentIds: field({
      type: [String],
      label: 'Assigned department ids',
    }),
    serviceNames: field({ type: [String], label: 'Selected service names' }),
    serviceTypes: field({ type: [String], label: 'Selected types' }),
    createdAt: field({
      default: Date.now(),
      type: Date,
      label: 'Created at',
      index: true,
    }),
    createdBy: field({
      type: String,
      label: 'Created by user id',
      index: true,
    }),
    updatedAt: field({
      type: Date,
      label: 'Last updated at',
    }),
    updatedBy: field({
      type: String,
      label: 'Last updated by user id',
    }),
  }),
  'erxes_dashboard',
);

export const sectionSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    type: field({ type: String, label: 'Type' }),
    createdAt: field({
      default: Date.now(),
      type: Date,
      label: 'Created at',
      index: true,
    }),
    createdBy: field({
      type: String,
      label: 'Created by user id',
      index: true,
    }),
    updatedAt: field({
      type: Date,
      label: 'Last updated at',
    }),
    updatedBy: field({
      type: String,
      label: 'Last updated by user id',
    }),
  }),
  'erxes_section',
);

export const chartSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Chart name', index: true }),
    dashboardId: field({
      type: String,
      label: 'Id of a corresponding dashboard',
      index: true,
    }),
    contentType: field({ type: String, label: 'Content type' }),
    serviceName: field({ type: String, label: 'Service name' }),
    layout: field({ type: String, label: 'Dashboard item - layout' }),
    vizState: field({ type: String }),
    templateType: field({
      type: String,
      label: 'Template name coming from plugins config',
      index: true,
    }),
    order: field({ type: Number, label: 'Order number' }),
    chartType: field({ type: IChartType, label: 'Chart type' }),
    filter: field({ type: JSON, label: 'Filters' }),
    dimension: field({ type: JSON, label: 'Dimension' }),
    defaultFilterId: field({ type: String, label: 'Default filter id' }),
  }),
  'erxes_dashboard_chart',
);
