import { Document, Schema } from "mongoose";
import { field, schemaHooksWrapper } from "./utils";

enum IVisibilityType {
  PUBLIC = "public",
  PRIVATE = "private"
}

enum IChartFilterType {
  DATE = "date",
  STRING = "string",
  NUMBER = "number"
}

enum IChartType {
  PIE = "pie",
  BAR = "bar",
  LINE = "line",
  DOUGHNUT = "doughnut",
  RADAR = "radar",
  POLARAREA = "polarArea",
  TABLE = "table",
  NUMBER = "number",
  PIVOTTABLE = "pivotTable"
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

export interface IDashboard {
  name: string;
  sectionId: string;

  userId?: string;
  userIds?: string[];
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

export interface IReport {
  name: string;
  visibility: IVisibilityType;
  memberIds: string[];
  tagIds: string[];

  createdAt: Date;
  createdBy: string;

  updatedAt: Date;
  updatedBy: string;

  serviceName?: string;
  serviceType?: string;

  userId?: string;
  userIds?: string[];
  assignedUserIds: string[];
  assignedDepartmentIds: string[];

  charts?: IChartDocument[];

  sectionId?: string;
}

export interface IReportDocument extends IReport, Document {
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
  contentId: string;

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

export interface IChartDocument extends IChart, Document {
  _id: string;
}

export const dashboardSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: "Name" }),
    sectionId: field({ type: String, label: "Section id" }),
    visibility: field({
      type: String,
      enum: Object.values(IVisibilityType),
      label: "Dashboard visibility"
    }),
    userIds: field({ type: [String], label: 'Member ids' }),
    assignedUserIds: field({ type: [String], label: "Assigned member ids" }),
    assignedDepartmentIds: field({
      type: [String],
      label: "Assigned department ids"
    }),
    serviceNames: field({ type: [String], label: "Selected service names" }),
    serviceTypes: field({ type: [String], label: "Selected types" }),
    createdAt: field({
      default: Date.now(),
      type: Date,
      label: "Created at",
      index: true
    }),
    createdBy: field({
      type: String,
      label: "Created by user id",
      index: true
    }),
    updatedAt: field({
      type: Date,
      label: "Last updated at"
    }),
    updatedBy: field({
      type: String,
      label: "Last updated by user id"
    })
  }),
  "erxes_dashboard"
);

export const reportSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: "Report name", index: true }),
  visibility: field({
    type: String,
    enum: Object.values(IVisibilityType),
    label: "Report visibility"
  }),
  userIds: field({ type: [String], label: 'Member ids' }),
  assignedUserIds: field({ type: [String], label: "Assigned member ids" }),
  assignedDepartmentIds: field({
    type: [String],
    label: "Assigned department ids"
  }),
  tagIds: field({ type: [String], label: "Assigned tag ids" }),
  createdAt: field({
    default: Date.now(),
    type: Date,
    label: "Created at",
    index: true
  }),
  serviceName: field({ type: String, label: "Service name" }),
  serviceType: field({ type: String, label: "Service type" }),
  sectionId: field({ type: String, label: "Section id" }),
  createdBy: field({
    type: String,
    label: "Created by user id",
    index: true
  }),
  updatedAt: field({
    type: Date,
    label: "Last updated at"
  }),
  updatedBy: field({
    type: String,
    label: "Last updated by user id"
  })
});

export const sectionSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: "Name" }),
    type: field({ type: String, label: "Type" }),
    createdAt: field({
      default: Date.now(),
      type: Date,
      label: "Created at",
      index: true
    }),
    createdBy: field({
      type: String,
      label: "Created by user id",
      index: true
    }),
    updatedAt: field({
      type: Date,
      label: "Last updated at"
    }),
    updatedBy: field({
      type: String,
      label: "Last updated by user id"
    })
  }),
  "erxes_section"
);

export const chartSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: "Chart name", index: true }),
    contentId: field({
      type: String,
      label: "Id of a corresponding insight",
      index: true
    }),
    contentType: field({ type: String, label: "Content type" }),
    serviceName: field({ type: String, label: "Service name" }),
    layout: field({ type: String, label: "Insight item - layout" }),
    vizState: field({ type: String }),
    templateType: field({
      type: String,
      label: "Template name coming from plugins config",
      index: true
    }),
    order: field({ type: Number, label: "Order number" }),
    chartType: field({
      type: String,
      enum: Object.values(IChartType),
      label: "Chart type"
    }),
    filter: field({ type: JSON, label: "Filters" }),
    dimension: field({ type: JSON, label: "Dimension" }),
    defaultFilterId: field({ type: String, label: "Default filter id" })
  }),
  "erxes_insight_chart"
);
