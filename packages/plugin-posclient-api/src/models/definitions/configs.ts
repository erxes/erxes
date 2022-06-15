import { Document, Schema } from 'mongoose';
import { IConfigModel } from '../Configs';
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
  brandId?: string;
  tagIds?: string[];
  productDetails: string[];
  adminIds: string[];
  cashierIds: string[];
  beginNumber: string;
  maxSkipNumber: number;
  kitchenScreen: any;
  waitingScreen: any;
  kioskMachine?: any;
  formSectionTitle?: string;
  formIntegrationIds?: string[];
  token?: string;
  uiOptions: IUIOptions;
  ebarimtConfig?: IEbarimtConfig;
  qpayConfig?: IQPayConfig;
  syncInfo: ISyncInfo;
  catProdMappings: ICatProd[];
  initialCategoryIds: string[];
  kioskExcludeProductIds: string[];
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
    companyName: { type: String, label: 'Company name' },
    ebarimtUrl: { type: String, label: 'Ebarimt server url' },
    checkCompanyUrl: { type: String, label: 'Company info url' },
    hasVat: { type: Boolean },
    hasCitytax: { type: Boolean },
    districtCode: { type: String, label: 'Province or district code' },
    companyRD: { type: String, label: 'Company register number' },
    defaultGSCode: { type: String, label: 'Default inventory code' },
    vatPercent: { type: Number, optional: true, label: 'Vat percent' },
    cityTaxPercent: {
      type: Number,
      optional: true,
      label: 'UB city tax percent'
    },
    footerText: { type: String, label: 'Footer text' }
  },
  { _id: false }
);

const qpayConfigSchema = new Schema(
  {
    url: { type: String, label: 'QPay url' },
    callbackUrl: { type: String, label: 'Callback url' },
    username: { type: String, label: 'QPay username' },
    password: { type: String, label: 'QPay password' },
    invoiceCode: { type: String, label: 'QPay invoice' }
  },
  { _id: false }
);

export const configSchema = new Schema({
  _id: field({ pkey: true }),
  name: { type: String, label: 'Name' },
  description: { type: String, label: 'Description' },
  userId: { type: String, optional: true, label: 'Created by' },
  createdAt: getDateFieldDefinition('Created at'),
  integrationId: { type: String, label: 'Erxes integration' },
  productDetails: { type: [String] },
  adminIds: { type: [String] },
  cashierIds: { type: [String] },
  beginNumber: { type: String },
  maxSkipNumber: { type: Number },
  waitingScreen: { type: Object },
  kioskMachine: { type: Object, optional: true },
  kitchenScreen: { type: Object },
  formSectionTitle: { type: String },
  formIntegrationIds: { type: [String] },
  brandId: { type: String },
  token: { type: String, label: 'Token generated at erxes-api' },
  uiOptions: { type: Object, label: 'Logo & color configs' },
  ebarimtConfig: { type: ebarimtConfigSchema },
  qpayConfig: { type: qpayConfigSchema },
  syncInfo: { type: Object, optional: true },
  catProdMappings: { type: [Object], label: 'Product category mappings' },
  initialCategoryIds: { type: [String], label: 'Pos initial categories' },
  kioskExcludeProductIds: { type: [String], label: 'kiosk Exclude Products' }
});

export const productGroupSchema = new Schema({
  _id: field({ pkey: true }),
  name: { type: String },
  description: { type: String },
  posId: { type: String },
  categoryIds: { type: [String], optional: true },
  excludedCategoryIds: { type: [String], optional: true },
  excludedProductIds: { type: [String], optional: true }
});
