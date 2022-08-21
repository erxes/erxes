import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IDashboard {
  name: string;
  visibility: string;
  selectedMemberIds?: string[];
  description?: string;
  parentId?: string;
  childsDashboard?: [IDashboard];
  createdBy?: string;
  updatedBy?: string;
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
  updatedAt: Date;
  order?: string;
  dashboardCount?: number;
  relatedIds?: string[];
  createdBy?: string;
  updatedBy?: string;
}
export interface IDashboardItemDocument extends IDashboardItem, Document {
  _id: string;
  createdAt: Date;
}

export const dashboardSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String }),
    description: field({ type: String, optional: true }),
    visibility: field({ type: String, optional: true }),
    selectedMemberIds: field({ type: [String] }),
    parentId: field({ type: String, optional: true }),
    childsDashboard: field({ type: [String] }),
    order: field({ type: String }),

    code: field({ type: String }),
    dashboardCount: field({ type: Number }),
    relatedIds: field({ type: [String] }),

    createdAt: {
      type: Date,
      default: new Date(),
      label: 'Created date'
    },
    createdBy: { type: String },
    updatedAt: { type: Date, default: new Date(), label: 'Updated date' },
    updatedBy: { type: String }
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

dashboardSchema.index({ type: 1, order: 1, name: 1 });
