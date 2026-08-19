import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

const reportChartPropertyValueSchema = new Schema(
  {
    propertyId: { type: String, required: true },
    type: { type: String },
    values: { type: [String], default: [] },
  },
  { _id: false },
);

const reportChartFiltersSchema = new Schema(
  {
    date: { type: String },
    fromDate: { type: String },
    toDate: { type: String },
    status: { type: String },
    statusIds: { type: [String], default: undefined },
    source: { type: String },
    state: { type: String },
    frequency: { type: String },
    startDate: { type: String },
    targetDate: { type: String },
    groupPropertyId: { type: String },
    channelIds: { type: [String], default: undefined },
    memberIds: { type: [String], default: undefined },
    pipelineIds: { type: [String], default: undefined },
    tagIds: { type: [String], default: undefined },
    customerIds: { type: [String], default: undefined },
    companyIds: { type: [String], default: undefined },
    branchIds: { type: [String], default: undefined },
    pageIds: { type: [String], default: undefined },
    searchValue: { type: String },
    propertyIds: { type: [String], default: undefined },
    priority: { type: [Number], default: undefined },
    propertyValueFilters: {
      type: [reportChartPropertyValueSchema],
      default: undefined,
    },
  },
  { _id: false },
);

export const reportChartSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true, label: 'Name' },
    chartType: {
      type: String,
      required: true,
      index: true,
      label: 'Chart type',
    },
    visualType: { type: String, label: 'Visual type' },
    colSpan: { type: Number, default: 6, label: 'Column span' },
    filters: { type: reportChartFiltersSchema, default: () => ({}) },
    createdBy: { type: String, label: 'Created by' },
  },
  { timestamps: true },
);
