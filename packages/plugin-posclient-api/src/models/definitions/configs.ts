import { Document, Schema } from 'mongoose';
import { field, getDateFieldDefinition } from './utils';

export interface IEbarimtConfig {
  companyName: string;
  ebarimtUrl: string;
  checkTaxpayerUrl: string;

  merchantTin: string;
  companyRD: string,
  districtCode: string;
  posNo: string;
  branchNo: string;

  hasVat: boolean;
  hasCitytax: boolean;
  defaultGSCode: string,
  vatPercent: number,
  cityTaxPercent: number,
  reverseVatRules?: string[],
  reverseCtaxRules?: string[],
  footerText?: string;
  hasCopy: boolean;
}

interface IConfigColors {
  [key: string]: string;
}

interface IUIOptions {
  colors: IConfigColors;
  logo: string;
  bgImage: string;
  favIcon: string;
  receiptIcon: string;
  kioskHeaderImage: string;
  mobileAppImage: string;
  qrCodeImage: string;
  texts: IConfigColors;
}

interface ICatProd {
  _id: string;
  categoryId: string;
  code?: string;
  name?: string;
  productId: string;
}

export interface IConfig {
  name: string;
  description?: string;
  orderPassword?: string;
  pdomain?: string;
  productDetails?: string[];
  adminIds: string[];
  cashierIds: string[];
  paymentIds: string[];
  paymentTypes: any[];
  beginNumber?: string;
  maxSkipNumber?: number;
  kitchenScreen?: any;
  waitingScreen?: any;
  kioskMachine?: any;
  token: string;
  uiOptions: IUIOptions;
  ebarimtConfig?: IEbarimtConfig;
  erkhetConfig?: any;
  catProdMappings?: ICatProd[];
  initialCategoryIds?: string[];
  kioskExcludeCategoryIds?: string[];
  kioskExcludeProductIds?: string[];
  deliveryConfig?: any;
  cardsConfig?: any;
  posId: string;
  isOnline?: boolean;
  onServer?: boolean;
  branchId?: string;
  departmentId?: string;
  allowBranchIds?: string[];
  checkRemainder?: boolean;
  permissionConfig?: any;
  allowTypes: string[];
  isCheckRemainder: boolean;
  checkExcludeCategoryIds: string[];
  banFractions: boolean;
}

export interface IConfigDocument extends Document, IConfig {
  _id: string;
}

export interface IProductGroup { }

export interface IProductGroupDocument extends Document, IProductGroup {
  _id: string;
}

const ebarimtConfigSchema = new Schema(
  {
    companyName: field({ type: String, optional: true, label: 'Company name' }),
    ebarimtUrl: field({
      type: String,
      optional: true,
      label: 'Ebarimt server url',
    }),
    checkTaxpayerUrl: field({
      type: String,
      optional: true,
      label: 'Ebarimt tin url',
    }),

    merchantTin: field({ type: String, optional: true, label: 'Tin' }),
    companyRD: field({ type: String, optional: true, label: 'Company rd' }),
    districtCode: field({ type: String, optional: true, label: 'district Code' }),
    posNo: field({ type: String, optional: true, label: 'Pos NO' }),
    branchNo: field({ type: String, optional: true, label: 'Branch NO' }),
    hasVat: field({ type: Boolean, optional: true }),
    hasCitytax: field({ type: Boolean, optional: true }),
    defaultGSCode: field({
      type: String,
      optional: true,
      label: 'Default inventory code',
    }),
    vatPercent: field({ type: Number, optional: true, label: 'Vat percent' }),
    cityTaxPercent: {
      type: Number,
      optional: true,
      label: 'UB city tax percent',
    },
    reverseVatRules: field({ type: [String], optional: true, label: 'reverseVatRules' }),
    reverseCtaxRules: field({ type: [String], optional: true, label: 'reverseCtaxRules' }),
    footerText: field({ type: String, optional: true, label: 'Footer text' }),
    hasCopy: field({ type: Boolean, optional: true }),
  },
  { _id: false },
);

export const configSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, unique: true, label: 'Name' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  orderPassword: field({
    type: String,
    optional: true,
    label: ' OrderPassword',
  }),
  pdomain: field({ type: String, optional: true, label: 'Domain' }),
  userId: field({ type: String, optional: true, label: 'Created by' }),
  createdAt: getDateFieldDefinition('Created at'),
  productDetails: field({ type: [String] }),
  adminIds: field({ type: [String] }),
  cashierIds: field({ type: [String] }),
  paymentIds: field({ type: [String] }),
  paymentTypes: field({ type: [Object] }),
  beginNumber: field({ type: String, optional: true }),
  maxSkipNumber: field({ type: Number }),
  waitingScreen: field({ type: Object }),
  kioskMachine: field({ type: Object, optional: true }),
  kitchenScreen: field({ type: Object }),
  token: field({ type: String, label: 'Token generated at erxes-api' }),
  erxesAppToken: field({ type: String, label: 'Erxes app token' }),
  uiOptions: field({ type: Object, label: 'Logo & color configs' }),
  ebarimtConfig: field({ type: ebarimtConfigSchema, optional: true }),
  erkhetConfig: field({ type: Object }),
  catProdMappings: field({
    type: [Object],
    label: 'Product category mappings',
  }),
  initialCategoryIds: field({
    type: [String],
    label: 'Pos initial categories',
  }),
  kioskExcludeCategoryIds: field({
    type: [String],
    label: 'kiosk Exclude Categories',
  }),
  kioskExcludeProductIds: field({
    type: [String],
    label: 'kiosk Exclude Products',
  }),
  deliveryConfig: field({ type: Object }),
  cardsConfig: field({ type: Object }),
  posId: field({ type: String, label: 'Pos id' }),
  isOnline: field({ type: Boolean, optional: true }),
  onServer: field({ type: Boolean, optional: true }),
  branchId: field({ type: String, optional: true, label: 'Branch' }),
  departmentId: field({ type: String, optional: true, label: 'Department' }),
  allowBranchIds: field({
    type: [String],
    optional: true,
    label: 'Allow branches',
  }),
  checkRemainder: field({ type: Boolean, optional: true }),
  permissionConfig: field({ type: Object, optional: true }),
  allowTypes: field({ type: [String], label: 'Allow Types' }),
  isCheckRemainder: field({ type: Boolean, optional: true }),
  checkExcludeCategoryIds: field({ type: [String] }),
  banFractions: field({ type: Boolean, optional: true }),
  status: field({ type: String, optional: true }),
});

// products config
export interface IProductsConfig {
  code: string;
  value: any;
}

export interface IProductsConfigDocument extends IProductsConfig, Document {
  _id: string;
}

// Mongoose schemas ===========

export const productsConfigSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String, unique: true }),
  value: field({ type: Object }),
});
