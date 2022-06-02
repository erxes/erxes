import { QueryResponse } from '@erxes/ui/src/types';

export interface IRemainderParams {
  productId: string;
  departmentId?: string;
  branchId?: string;
  uomId?: string;
}

export interface IRemaindersParams {
  departmentId?: string;
  branchId?: string;
  productCategoryId?: string;
  productIds?: string[];
}

export interface IRemainder {
  productId: string;
  quantity: number;
  uomId: string;
  count: number;
  branchId: string;
  departmentId: string;
}

export interface IRemainderDocument extends IRemainder, Document {
  _id: string;
  modifiedAt: Date;
}

export interface IGetRemainder {
  _id: string;
  remainder: number;
  uomId: string;
}

// queries
export type RemaindersQueryResponse = {
  remainders: IRemainder[];
  refetch: () => void;
} & QueryResponse;

export type RemainderDetailQueryResponse = {
  remainderDetail: IRemainder;
  loading: boolean;
};
