import { IProductCategory } from '@erxes/ui-products/src/types';
import { IBranch, IDepartment } from '@erxes/ui-team/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { QueryResponse } from '@erxes/ui/src/types';

export type ListQueryVariables = {
  page?: number;
  perPage?: number;
  search?: string;
};

export type ISafeRemainder = {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;

  date: Date;
  description: string;

  status: string;
  branchId: string;
  departmentId: string;
  productCategoryId: string;

  branch: IBranch;
  department: IDepartment;
  productCategory: IProductCategory;
  modifiedUser: IUser;
};

export type ISafeRemaItem = {
  _id: string;
  modifiedAt: Date;
  lastTrDate: Date;
  remainderId: string;
  productId: string;
  quantity: number;
  uomId: string;
  count: number;
  branchId: string;
  departmentId: string;
};

export type SafeRemaindersQueryResponse = {
  safeRemainders: { remainders: ISafeRemainder[]; totalCount: number };
} & QueryResponse;

export type SafeRemainderDetailQueryResponse = {
  safeRemainderDetail: ISafeRemainder;
} & QueryResponse;

export type SafeRemItemsQueryResponse = {
  items: ISafeRemaItem[];
} & QueryResponse;

export type UpdateRemaindersMutationVariables = {
  productCategoryId?: string;
  productIds?: string[];
  departmentId: string;
  branchId: string;
};

export type UpdateRemaindersMutationResponse = {
  updateRemainders: (params: {
    variables: UpdateRemaindersMutationVariables;
  }) => Promise<any>;
};
