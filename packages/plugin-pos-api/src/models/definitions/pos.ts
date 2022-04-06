import { Document, Schema } from "mongoose";
import { field, schemaHooksWrapper } from "./utils";

const posOrderItemSchema = {
  _id: { type: String },
  createdAt: { type: Date },
  productId: { type: String, label: "Product" },
  count: { type: Number },
  unitPrice: { type: Number },
  discountAmount: { type: Number },
  discountPercent: { type: Number },
};

export const posOrdersSchema = {
  _id: { pkey: true },
  createdAt: { type: Date },
  status: { type: String, label: "Status of the order" },
  paidDate: { type: Date, label: "Paid date" },
  number: { type: String, label: "Order number" },
  customerId: { type: String, label: "Customer" },
  cardAmount: { type: Number },
  cashAmount: { type: Number },
  mobileAmount: { type: Number },
  totalAmount: { type: Number },
  finalAmount: { type: Number },
  shouldPrintEbarimt: {
    type: Boolean,
    label: "Should print ebarimt for this order",
  },
  printedEbarimt: { type: Boolean, label: "Printed ebarimt", default: false },
  billType: { type: String, label: "Ebarimt receiver entity type" },
  billId: { type: String, label: "Bill id" },
  registerNumber: { type: String, label: "Register number of the entity" },
  oldBillId: { type: String, label: "Previous bill id if it is changed" },
  type: { type: String },
  userId: { type: String, label: "Created user id" },

  items: { type: posOrderItemSchema, label: "items" },
  branchId: { type: String, label: "Branch" },
  posToken: { type: String, optional: true },
  syncId: { type: String, optional: true },

  syncedErkhet: { type: Boolean, default: false },
  deliveryInfo: {
    type: Object,
    optional: true,
    label: "Delivery Info, address, map, etc",
  },
};

export const posSChema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: "Name" }),
    description: field({ type: String, label: "Description", optional: true }),
    userId: field({ type: String, optional: true, label: "Created by" }),
    createdAt: field({ type: Date, label: "Created at" }),
    integrationId: field({ type: String, label: "Integration id" }),
    productDetails: field({ type: [String], label: "Product fields" }),
    adminIds: field({ type: [String], label: "Admin user ids" }),
    cashierIds: field({ type: [String], label: "Cashier ids" }),
    isOnline: field({ type: Boolean, label: "Is online pos" }),
    branchId: field({ type: String, optional: true, label: "Branch" }),
    allowBranchIds: field({
      type: [String],
      optional: true,
      label: "Allow branches",
    }),
    beginNumber: field({ type: String, optional: true, label: "Begin number" }),
    maxSkipNumber: field({
      type: Number,
      optional: true,
      label: "Skip number",
    }),
    waitingScreen: field({ type: Object, label: "Waiting screen config" }),
    kioskMachine: field({ type: Object, label: "Kiosk config" }),
    kitchenScreen: field({ type: Object, label: "Kitchen screen config" }),
    uiOptions: field({ type: Object, label: "UI Options" }),
    formSectionTitle: field({ type: String, label: "Form section title" }),
    formIntegrationIds: field({
      type: [String],
      label: "Form integration ids",
    }),
    token: field({ type: String, label: "Pos token" }),
    ebarimtConfig: field({ type: Object, label: "Ebarimt Config" }),
    erkhetConfig: field({ type: Object, label: "Erkhet Config" }),
    syncInfos: field({ type: Object, label: "sync info" }),
    catProdMappings: field({
      type: [Object],
      label: "Category product mappings",
      optional: true,
    }),
    initialCategoryIds: field({
      type: [String],
      label: "Pos initial categories",
    }),
    kioskExcludeProductIds: field({
      type: [String],
      label: "Kiosk exclude products",
    }),
    deliveryConfig: field({ type: Object, label: "Delivery Config" }),
  }),
  "erxes_pos"
);

export const productGroupSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: "Name" }),
    description: field({ type: String, label: "Description", optional: true }),
    posId: field({ type: String, label: "Pos id" }),
    categoryIds: field({
      type: [String],
      optional: true,
      label: "Category ids",
    }),

    excludedCategoryIds: field({
      type: [String],
      optional: true,
      label: "Exclude Category ids",
    }),

    excludedProductIds: field({
      type: [String],
      optional: true,
      label: "Exclude Product ids",
    }),
  }),
  "erxes_productGroup"
);
