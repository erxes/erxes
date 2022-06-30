import { QueryResponse } from '@erxes/ui/src/types';

// query types

export interface IWork {
  name?: string;
  status: string;
  dueDate: Date;
  startAt: Date;
  endAt: Date;
  jobId: string;
  job: any;
  flowId: string;
  flow: any;
  productId: string;
  product: any;
  count: string;
  intervalId?: string;
  interval: any;
  inBranchId?: string;
  inBranch: string;
  inDepartmentId?: string;
  inDepartment: string;
  outBranchId?: string;
  outBranch: string;
  outDepartmentId?: string;
  outDepartment: string;
  needProducts?: any[];
  resultProducts?: any[];
}

export interface IWorkDocument extends IWork, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

export type WorksQueryResponse = {
  works: IWork[];
} & QueryResponse;

export type WorksTotalCountQueryResponse = {
  worksTotalCount: number;
} & QueryResponse;
