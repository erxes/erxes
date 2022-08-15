import { Document, Schema } from 'mongoose';
import { field, getDateFieldDefinition } from './utils';

export interface IEbarimtConfig {
  companyName: string;
  ebarimtUrl: string;
  checkCompanyUrl: string;
  hasVat: boolean;
  hasCitytax: boolean;
  districtCode: string;
  companyRD: string;
  defaultGSCode: string;
  vatPercent: number;
  cityTaxPercent: number;
  footerText: string;
}

export interface IQPayConfig {
  url: string;
  callbackUrl: string;
  username: string;
  password: string;
  invoiceCode: string;
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

interface ISyncInfo {
  id: string;
  date: Date;
}

interface ICatProd {
  _id: string;
  categoryId: string;
  productId: string;
}

export interface IConfig {
  name: string;
  description?: string;
  productDetails?: string[];
  adminIds: string[];
  cashierIds: string[];
  beginNumber?: string;
  maxSkipNumber?: number;
  kitchenScreen?: any;
  waitingScreen?: any;
  kioskMachine?: any;
  token: string;
  uiOptions: IUIOptions;
  ebarimtConfig?: IEbarimtConfig;
  qpayConfig?: IQPayConfig;
  catProdMappings?: ICatProd[];
  initialCategoryIds?: string[];
  kioskExcludeProductIds?: string[];
  deliveryConfig?: any;
  posId: string;
  branchId: string;
}

export interface IConfigDocument extends Document, IConfig {
  _id: string;
}

export interface IProductGroup {}

export interface IProductGroupDocument extends Document, IProductGroup {
  _id: string;
}

const ebarimtConfigSchema = new Schema(
  {
    companyName: field({ type: String, label: 'Company name' }),
    ebarimtUrl: field({ type: String, label: 'Ebarimt server url' }),
    checkCompanyUrl: field({ type: String, label: 'Company info url' }),
    hasVat: field({ type: Boolean }),
    hasCitytax: field({ type: Boolean }),
    districtCode: field({ type: String, label: 'Province or district code' }),
    companyRD: field({ type: String, label: 'Company register number' }),
    defaultGSCode: field({ type: String, label: 'Default inventory code' }),
    vatPercent: field({ type: Number, optional: true, label: 'Vat percent' }),
    cityTaxPercent: {
      type: Number,
      optional: true,
      label: 'UB city tax percent'
    },
    footerText: field({ type: String, optional: true, label: 'Footer text' })
  },
  { _id: false }
);

const qpayConfigSchema = new Schema(
  {
    url: field({ type: String, label: 'QPay url' }),
    callbackUrl: field({ type: String, label: 'Callback url' }),
    username: field({ type: String, label: 'QPay username' }),
    password: field({ type: String, label: 'QPay password' }),
    invoiceCode: field({ type: String, label: 'QPay invoice' })
  },
  { _id: false }
);

export const configSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, label: 'Description' }),
  userId: field({ type: String, optional: true, label: 'Created by' }),
  createdAt: getDateFieldDefinition('Created at'),
  integrationId: field({ type: String, label: 'Erxes integration' }),
  productDetails: field({ type: [String] }),
  adminIds: field({ type: [String] }),
  cashierIds: field({ type: [String] }),
  beginNumber: field({ type: String, optional: true }),
  maxSkipNumber: field({ type: Number }),
  waitingScreen: field({ type: Object }),
  kioskMachine: field({ type: Object, optional: true }),
  kitchenScreen: field({ type: Object }),
  formSectionTitle: field({ type: String }),
  formIntegrationIds: field({ type: [String] }),
  brandId: field({ type: String }),
  token: field({ type: String, label: 'Token generated at erxes-api' }),
  uiOptions: field({ type: Object, label: 'Logo & color configs' }),
  ebarimtConfig: field({ type: ebarimtConfigSchema }),
  qpayConfig: field({ type: qpayConfigSchema }),
  catProdMappings: field({
    type: [Object],
    label: 'Product category mappings'
  }),
  initialCategoryIds: field({
    type: [String],
    label: 'Pos initial categories'
  }),
  kioskExcludeProductIds: field({
    type: [String],
    label: 'kiosk Exclude Products'
  }),
  deliveryConfig: field({
    type: Object
  }),
  posId: field({ type: String, label: 'Pos id' }),
  branchId: field({ type: String, label: 'Branch' })
});

export const productGroupSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  description: field({ type: String }),
  posId: field({ type: String }),
  categoryIds: field({ type: [String], optional: true }),
  excludedCategoryIds: field({ type: [String], optional: true }),
  excludedProductIds: field({ type: [String], optional: true })
});
