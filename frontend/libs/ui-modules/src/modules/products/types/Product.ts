import { CurrencyCode, IAttachment } from 'erxes-ui';

import { PRODUCT_FORM_SCHEMA } from '../constants/addProductFormSchema';
import { z } from 'zod';

export interface IProduct {
  _id: string;
  name: string;
  unitPrice: number;
  code: string;
  categoryId: string;
  category?: IProductCategory;
  branchId?: string;
  departmentId?: string;
  tagIds: string[];
  uom: string;
  type: 'product' | 'service' | 'unique' | 'subscription';
  currency: CurrencyCode;
}
export interface IBundleRuleItem {
  code: string;
  quantity: number;
  productIds: string[];
  products: IProduct[];
  priceValue: number;
  percent: number;
  priceType: "thisProductPricePercent" | "price" | "mainPricePercent";
  priceAdjustType: string;
  priceAdjustFactor: number;
  allowSkip: boolean;
}
export interface IDiscountValue {
  bonusName: string;
  discount: number;
  potentialBonus: number;
  sumDiscount: number;
  type: string;
  voucherCampaignId: string;
  voucherId: string;
  voucherName: string;
}
export interface IDealBundleItem {
  bundleCode: string;
  count: number;
  total: number;
  selectedProductId?: string;
  selectedProduct?: IProduct;
  bundleSnapshot?: IBundleRuleItem;
}
export interface IProductData {
  _id: string;
  productId?: string;
  product?: IProduct;
  uom?: string;
  currency?: string;
  quantity: number;
  unitPrice: number;
  globalUnitPrice: number;
  unitPricePercent: number;
  taxPercent: number;
  tax: number;
  vatPercent: number;
  discountPercent: number;
  discount: number;
  amount: number;
  tickUsed?: boolean;
  isVatApplied?: boolean;
  assignUserId?: string;
  maxQuantity: number;
  branchId?: string;
  departmentId?: string;
  assignedUserId?: string;
  conditions?: IDealBundleItem[];
}

export interface IProductCategory {
  _id: string;
  name: string;
  avatar: IAttachment;
  code: string;
  order: string;
  productCount: number;
  parentId: string;
}

export interface IUom {
  _id: string;
  name: string;
  code: string;
  productCount: number;
}

export interface IProductDetail extends IProduct {
  shortName: string;
  description: string;
  barcodeDescription: string;
  barcodes: string[];
  vendorId: string;
}

export type IProductFormValues = z.infer<typeof PRODUCT_FORM_SCHEMA>;
