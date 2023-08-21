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
  hasCopy?: boolean;
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
    footerText: field({ type: String, optional: true, label: 'Footer text' }),
    hasCopy: field({ type: Boolean })
  },
  { _id: false }
);

export const configSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, unique: true, label: 'Name' }),
  description: field({ type: String, optional: true, label: 'Description' }),
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
  ebarimtConfig: field({ type: ebarimtConfigSchema }),
  erkhetConfig: field({ type: Object }),
  catProdMappings: field({
    type: [Object],
    label: 'Product category mappings'
  }),
  initialCategoryIds: field({
    type: [String],
    label: 'Pos initial categories'
  }),
  kioskExcludeCategoryIds: field({
    type: [String],
    label: 'kiosk Exclude Categories'
  }),
  kioskExcludeProductIds: field({
    type: [String],
    label: 'kiosk Exclude Products'
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
    label: 'Allow branches'
  }),
  checkRemainder: field({ type: Boolean, optional: true }),
  permissionConfig: field({ type: Object, optional: true }),
  allowTypes: field({ type: [String], label: 'Allow Types' })
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
