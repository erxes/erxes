import { Document } from 'mongoose';

export interface IPos {
  name: string;
  description?: string;
  orderPassword?: string;
  scopeBrandIds?: string[];
  pdomain?: string;
  userId: string;
  createdAt: Date;
  productDetails?: string;
  adminIds?: string[];
  cashierIds?: string[];
  paymentIds?: string[];
  paymentTypes?: any[];
  erxesAppToken: string;
  isOnline?: boolean;
  onServer?: boolean;
  branchId?: string;
  departmentId?: string;
  allowBranchIds?: string[];
  beginNumber?: string;
  maxSkipNumber?: number;
  waitingScreen?: any;
  kioskMachine?: any;
  kitchenScreen?: any;
  uiOptions?: any;
  token: string;
  ebarimtConfig?: any;
  erkhetConfig?: any;
  syncInfos?: any;
  catProdMappings?: any;
  initialCategoryIds?: string;
  kioskExcludeCategoryIds?: string;
  kioskExcludeProductIds?: string;
  deliveryConfig?: any;
  cardsConfig?: any;
  checkRemainder?: boolean;
  permissionConfig?: any;
  allowTypes: string[];
  isCheckRemainder: boolean;
  checkExcludeCategoryIds: string[];
  banFractions: boolean;
}
export interface IPosDocument extends IPos, Document {
  _id: string;
}

export interface IProductGroup {
  name: string;
  description: string;
  posId: string;
  categoryIds?: string[];
  excludedCategoryIds?: string[];
  excludedProductIds: string[];
}
export interface IProductGroupDocument extends IProductGroup, Document {
  _id: string;
}

export interface IPosSlot {
  _id?: string;
  posId: string;
  name: string;
  code: string;
  options: {
    [key: string]: string | number;
  };
}

export interface IPosSlotDocument extends IPosSlot, Document {
  _id: string;
}
