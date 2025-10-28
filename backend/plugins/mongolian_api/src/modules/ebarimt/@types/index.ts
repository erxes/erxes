import { ICursorPaginateParams } from "erxes-api-shared/core-types";


export interface IProductGroupParams extends ICursorPaginateParams {
    searchValue: string,
    productId: string,
    status: string
}

import { Document } from 'mongoose';


export interface IEbarimt {
  customerName?: string;
  customerTin?: string;    // Taxpayer ID
  billId?: string;
  billType?: string;       // e.g., "1" = VAT, "3" = Non-VAT
  totalAmount: number;
  vatAmount?: number;
  cityTaxAmount?: number;
  districtCode?: string;

  // Related information
  products?: Array<{
    productId: string;
    name: string;
    count: number;
    unitPrice: number;
    totalPrice: number;
  }>;

  status?: 'new' | 'sent' | 'failed' | 'cancelled';
  createdBy?: string;
}

export interface IEbarimtDocument extends IEbarimt, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

/* ===========================
 * PRODUCT GROUP
 * =========================== */
export interface IProductGroup {
  mainProductId: string;
  subProductId: string;
  sortNum: number;
  ratio?: number;
  isActive: boolean;
  modifiedBy?: string;
}

export interface IProductGroupDocument extends IProductGroup, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

/* PRODUCT RULE*/
export interface IProductRule {
  title: string;
  productIds?: string[];
  productCategoryIds?: string[];
  excludeCategoryIds?: string[];
  excludeProductIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];
  kind: string; // vat or ctax
  taxType?: string;
  taxCode?: string;
  taxPercent?: number;
}

export interface IProductRuleDocument extends IProductRule, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export type {
  IEbarimt,
  IEbarimtDocument,
  IProductGroup,
  IProductGroupDocument,
  IProductRule,
  IProductRuleDocument,
};
