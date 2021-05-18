import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IDashboard {
  name: string;
}

export interface IDashboardItemInput {
  dashboardId: string;
  layout: string;
  vizState: string;
  name: string;
  type: string;
}
export interface IDashboardItem {
  dashboardId: string;
  layout: string;
  vizState: string;
  name: string;
  type: string;
}

export interface IDashboardItemEdit {
  dashboardId?: string;
  layout?: string;
  vizState?: string;
  name?: string;
  type?: string;
  isDateRange?: boolean;
}

export interface IDashboardDocument extends IDashboard, Document {
  _id: string;
  createdAt: Date;
}
export interface IDashboardItemDocument extends IDashboardItem, Document {
  _id: string;
  createdAt: Date;
}

export const dashboardSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String })
  })
);

export const dashboardItemSchema = new Schema({
  _id: field({ pkey: true }),
  dashboardId: { type: String },
  layout: field({ type: String }),
  vizState: field({ type: String }),
  name: field({ type: String }),
  type: field({ type: String }),
  isDateRange: field({ type: Boolean })
});
