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
  needProductsDetail?: any[];
  resultProductsDetail?: any[];
}

export interface IOverallWorkDocument extends IOverallWork, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
}

export interface IPerform {
  overallWorkId: string;
  overallWork: any;
  status: string;
  productId: string;
  count: string;
  startAt: Date;
  endAt: Date;
  dueAt: Date;
  needProducts: any[];
  resultProducts: any[];
}

export interface IPerformDocument extends IPerform, Document {
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

export type OverallWorksSideBarQueryResponse = {
  overallWorksSideBar: IOverallWork[];
} & QueryResponse;

export type OverallWorksSideBarDetailQueryResponse = {
  overallWorksSideBarDetail: IOverallWorkDocument;
} & QueryResponse;

export type OverallWorksTotalCountQueryResponse = {
  overallWorksTotalCount: number;
} & QueryResponse;

export type PerformsQueryResponse = {
  performs: IPerform[];
} & QueryResponse;

export type PerformsByOverallWorkIdQueryResponse = {
  performsByOverallWorkId: IPerform[];
} & QueryResponse;

export type PerformsTotalCountQueryResponse = {
  performsTotalCount: number;
} & QueryResponse;

export type PerformsByOverallWorkIdTotalCountQueryResponse = {
  performsByOverallWorkIdTotalCount: number;
} & QueryResponse;

export type AllProductsQueryResponse = {
  allProducts: any[];
} & QueryResponse;
