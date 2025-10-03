import { Schema } from 'mongoose';
import { mongoStringRequired, schemaWrapper } from 'erxes-api-shared/utils';

export const posSchema = schemaWrapper(
  new Schema({
    _id: mongoStringRequired,
    name: { type: String, label: 'Name' },
    description: { type: String, label: 'Description', optional: true },
    orderPassword: {
      type: String,
      label: 'OrderPassword',
      optional: true,
    },
    pdomain: { type: String, optional: true, label: 'Domain' },
    userId: { type: String, optional: true, label: 'Created by' },
    createdAt: { type: Date, label: 'Created at' },
    productDetails: { type: [String], label: 'Product fields' },
    adminIds: { type: [String], label: 'Admin user ids' },
    cashierIds: { type: [String], label: 'Cashier ids' },
    isOnline: { type: Boolean, label: 'Is online pos' },
    paymentIds: { type: [String], label: 'Online Payments' },
    paymentTypes: { type: [Object], label: 'Other Payments' },
    onServer: {
      type: Boolean,
      optional: true,
      label: 'On cloud server',
    },
    branchId: { type: String, optional: true, label: 'Branch' },
    departmentId: { type: String, optional: true, label: 'Branch' },
    allowBranchIds: {
      type: [String],
      optional: true,
      label: 'Allow branches',
    },
    beginNumber: { type: String, optional: true, label: 'Begin number' },
    maxSkipNumber: {
      type: Number,
      optional: true,
      label: 'Skip number',
    },
    waitingScreen: { type: Object, label: 'Waiting screen config' },
    kioskMachine: { type: Object, label: 'Kiosk config' },
    kitchenScreen: { type: Object, label: 'Kitchen screen config' },
    uiOptions: { type: Object, label: 'UI Options' },
    token: { type: String, label: 'Pos token' },
    erxesAppToken: { type: String, label: 'Erxes App token' },
    ebarimtConfig: {
      type: Object,
      optional: true,
      label: 'Ebarimt Config',
    },
    erkhetConfig: { type: Object, label: 'Erkhet Config' },
    syncInfos: { type: Object, label: 'sync info' },
    catProdMappings: {
      type: [Object],
      label: 'Category product mappings',
      optional: true,
    },
    initialCategoryIds: {
      type: [String],
      label: 'Pos initial categories',
    },
    kioskExcludeCategoryIds: {
      type: [String],
      label: 'Kiosk exclude categories',
    },
    kioskExcludeProductIds: {
      type: [String],
      label: 'Kiosk exclude products',
    },
    deliveryConfig: { type: Object, label: 'Delivery Config' },
    cardsConfig: { type: Object, label: 'Cards Config' },
    checkRemainder: { type: Boolean, optional: true },
    permissionConfig: {
      type: Object,
      optional: true,
      label: 'Permission',
    },
    allowTypes: { type: [String], label: 'Allow Types' },
    isCheckRemainder: { type: Boolean, label: 'is Check Remainder' },
    checkExcludeCategoryIds: {
      type: [String],
      label: 'Check Exclude Categories',
    },
    banFractions: { type: Boolean, label: 'has Float count' },
    status: { type: String, label: 'Status', optional: true },
  })
);

export const productGroupSchema = schemaWrapper(
  new Schema({
    _id: mongoStringRequired,
    name: { type: String, label: 'Name' },
    description: { type: String, label: 'Description', optional: true },
    posId: { type: String, label: 'Pos id' },
    categoryIds: {
      type: [String],
      optional: true,
      label: 'Category ids',
    },

    excludedCategoryIds: {
      type: [String],
      optional: true,
      label: 'Exclude Category ids',
    },

    excludedProductIds: {
      type: [String],
      optional: true,
      label: 'Exclude Product ids',
    },
  })
);

export const posSlotSchema = schemaWrapper(
  new Schema({
    _id: mongoStringRequired,
    name: { type: String, label: 'Name' },
    code: { type: String, label: 'Code' },
    posId: { type: String, label: 'Pos' },
    option: { type: Object, label: 'Option' },
  })
);
