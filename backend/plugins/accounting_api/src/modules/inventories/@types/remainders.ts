import { Document } from 'mongoose';

export interface IRemainderParams {
  departmentId?: string;
  branchId?: string;
  productId: string;
  uom?: string;
}

export interface IRemainderProductsParams {
  departmentId?: string;
  branchId?: string;
  categoryId?: string;

  searchValue?: string;
  page?: number;
  perPage?: number;
}

export interface IRemaindersParams {
  departmentIds?: string[];
  branchIds?: string[];
  productCategoryId?: string;
  productIds?: string[];
  searchValue?: string;
}

export interface IRemainderCount {
  _id: string;
  count: number;
  uom: string;
}

export interface IRemainder {
  branchId: string;
  departmentId: string;
  productId: string;
  count: number;
  soonIn?: number;
  soonOut?: number;
  shortLogs: any[];
}

export interface IRemainderDocument extends IRemainder, Document {
  _id: string;
  modifiedAt: Date;
}
