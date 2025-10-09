import { Document } from 'mongoose';

export interface IEbarimtConfig {
  companyName: string;
  ebarimtUrl: string;
  checkTaxpayerUrl: string;

  merchantTin: string;
  companyRD: string;
  districtCode: string;
  posNo: string;
  branchNo: string;

  hasVat: boolean;
  hasCitytax: boolean;
  defaultGSCode: string;
  vatPercent: number;
  cityTaxPercent: number;
  reverseVatRules?: string[];
  reverseCtaxRules?: string[];
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

export interface IProductGroup {}

export interface IProductGroupDocument extends Document, IProductGroup {
  _id: string;
}
// products config
export interface IProductsConfig {
  code: string;
  value: any;
}

export interface IProductsConfigDocument extends IProductsConfig, Document {
  _id: string;
}
