import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import { QueryResponse } from '@erxes/ui/src/types';

// query types

export interface IWork {
  name?: string;
  status: string;
  dueDate: Date;
  startAt: Date;
  endAt: Date;
  flowId: string;
  flow: any;
  count: string;
  intervalId?: string;
  interval: any;

  inBranchId?: string;
  inDepartmentId?: string;
  outBranchId?: string;
  outDepartmentId?: string;
  inBranch: IBranch;
  inDepartment: IDepartment;
  outBranch: IBranch;
  outDepartment: IDepartment;
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
