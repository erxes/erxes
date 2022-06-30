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

export interface IOverallWork {
  status: string;
  dueDate: Date;
  startAt: Date;
  endAt: Date;
  assignUserIds: string[];
  jobId: string;
  job: any;
  flowId: string;
  flow: any;
  intervalId?: string;
  interval: any;
  outBranchId?: string;
  outBranch: string;
  outDepartmentId?: string;
  outDepartment: string;
  inBranchId?: string;
  inBranch: any;
  inDepartmentId?: string;
  inDepartment: string;
  needProducts?: any[];
  resultProducts?: any[];
}

export interface IOverallWorkDocument extends IOverallWork, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
}

export type WorksQueryResponse = {
  works: IWork[];
} & QueryResponse;

export type WorksTotalCountQueryResponse = {
  worksTotalCount: number;
} & QueryResponse;

export type OverallWorksQueryResponse = {
  overallWorks: IOverallWork[];
} & QueryResponse;

export type OverallWorksTotalCountQueryResponse = {
  overallWorksTotalCount: number;
} & QueryResponse;
