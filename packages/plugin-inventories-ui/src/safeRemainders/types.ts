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

  branch: IBranch;
  department: IDepartment;
  modifiedUser: IUser;
};

export type SafeRemaindersQueryResponse = {
  safeRemainders: { remainders: ISafeRemainder[]; totalCount: number };
} & QueryResponse;

export type SafeRemainderDetailQueryResponse = {
  safeRemainderDetail: ISafeRemainder;
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
