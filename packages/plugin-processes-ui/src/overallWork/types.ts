import { IBranch, IDepartment } from '@erxes/ui/src/team/types';

import { IProduct } from '@erxes/ui-products/src/types';
import { QueryResponse } from '@erxes/ui/src/types';
import { IJobRefer } from '../job/types';

export interface IOverallWorkKey {
  type: string;
  inBranchId: string;
  inDepartmentId: string;
  outBranchId: string;
  outDepartmentId: string;
  typeId?: string;
}
export interface IOverallWork {
  _id: string;
  key: IOverallWorkKey;
  type: string;
  workIds: string[];
  count: number;
  needProducts: any;
  resultProducts: any;
  jobReferId?: string;
  jobRefer?: IJobRefer;
  product?: IProduct;
  inDepartmentId?: string;
  inBranchId?: string;
  outDepartmentId?: string;
  outBranchId?: string;
  inDepartment?: IDepartment;
  inBranch?: IBranch;
  outDepartment?: IDepartment;
  outBranch?: IBranch;
}

export type IOverallWorkDet = {
  startAt: Date;
  dueDate: Date;
  interval?: any;
  intervalId?: string;
  needProductsData: any;
  resultProductsData: any;
} & IOverallWork;

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
