import { Schema } from 'mongoose';

/**
 * Sync Log Schema
 */
export const syncLogSchema = new Schema(
  {
    contentType: {
      type: String,
      index: true,
    },
    contentId: {
      type: String,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdBy: {
      type: String,
    },
    consumeData: {
      type: Schema.Types.Mixed,
    },
    consumeStr: {
      type: String,
    },
    sendData: {
      type: Schema.Types.Mixed,
    },
    sendStr: {
      type: String,
    },
    responseData: {
      type: Schema.Types.Mixed,
    },
    responseStr: {
      type: String,
    },
    sendSales: {
      type: [String],
    },
    responseSales: {
      type: [String],
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: false,
  },
);

/**
 * Customer Relation Schema
 */
export const customerRelationSchema = new Schema(
  {
    customerId: {
      type: String,
      index: true,
    },
    brandId: {
      type: String,
      index: true,
    },
    no: {
      type: String,
      index: true,
    },
    modifiedAt: {
      type: Date,
    },
    filter: {
      type: String,
    },
    response: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: false,
  },
);
