import { IBranch, IDepartment } from '@erxes/ui/src/team/types';

import { IProduct } from '@erxes/ui-products/src/types';
import { QueryResponse } from '@erxes/ui/src/types';
import { IJobRefer } from '../job/types';

export interface IOverallWorkKey {
  type: string;
  typeId: string;
  inBranchId: string;
  inDepartmentId: string;
  outBranchId: string;
  outDepartmentId: string;
}
export interface IOverallWork {
  _id: string;
  key: IOverallWorkKey;
  type: string;
  workIds: string[];
  count: number;
  needProducts: any;
  resultProducts: any;
  jobRefer?: IJobRefer;
  product?: IProduct;
  inDepartment?: IDepartment;
  inBranch?: IBranch;
  outDepartment?: IDepartment;
  outBranch?: IBranch;
}

export type IOverallWorkDet = {
  startAt: Date;
  dueDate: Date;
  interval: any;
  intervalId: string;
  needProductsData: any;
  resultProductsData: any;
} & IOverallWork;

export type IPerform = {
  _id: string;
  overallWorkId: string;
  overallWorkKey: IOverallWorkKey;
  type: string;
  typeId: string;
  count: string;
  status: string;
  startAt: Date;
  endAt: Date;
  dueAt: Date;
  needProducts: any[];
  resultProducts: any[];
  inDepartmentId?: string;
  inBranchId?: string;
  outDepartmentId?: string;
  outBranchId?: string;

  inDepartment?: IDepartment;
  inBranch?: IBranch;
  outDepartment?: IDepartment;
  outBranch?: IBranch;
};

export type OverallWorksQueryResponse = {
  overallWorks: IOverallWork[];
  loading: boolean;
  refetch: () => void;
} & QueryResponse;

export type OverallWorksCountQueryResponse = {
  overallWorksCount: number;
  loading: boolean;
  refetch: () => void;
} & QueryResponse;

export type OverallWorkDetailQueryResponse = {
  overallWorkDetail: IOverallWorkDet;
  loading: boolean;
  error?: Error;
  refetch: () => void;
};

export type PerformsQueryResponse = {
  performs: IOverallWorkDet;
  loading: boolean;
  refetch: () => void;
};

export type PerformsCountQueryResponse = {
  performsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type IPerformAddParams = {
  jobType: string;
  jobReferId: string;
  productId: string;

  inBranchId: string;
  inDepartmentId: string;
  outBranchId: string;
  outDepartmentId: string;
};

export type ICommonParams = {
  count: number;
  startAt: Date;
  endAt: Date;
  status: string;

  needProducts: any;
  resultProducts: any;
};

export type PerformAddMutationResponse = {
  performAdd: (mutation: {
    variables: IPerformAddParams & ICommonParams;
  }) => Promise<any>;
};

export type PerformEditMutationResponse = {
  performEdit: (mutation: {
    variables: IPerformAddParams & ICommonParams & { _id: string };
  }) => Promise<any>;
};

export type PerformChangeMutationResponse = {
  performChange: (mutation: {
    variables: ICommonParams & { _id: string };
  }) => Promise<any>;
};

export type PerformRemoveMutationResponse = {
  performRemove: (mutation: { variables: { _id: string } }) => Promise<any>;
};
