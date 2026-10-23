import { Document } from 'mongoose';
import { IJobCost, IJobItem } from './jobs';

export interface IJobExecutionListParams {
  searchValue?: string;
  status?: string;
  jobId?: string;
  jobName?: string;
  inputProductId?: string;
  outputProductId?: string;
  laborCostName?: string;
  overheadCostName?: string;
  inputAccountId?: string;
  inputBranchId?: string;
  inputDepartmentId?: string;
  outputAccountId?: string;
  outputBranchId?: string;
  outputDepartmentId?: string;
  page?: number;
  perPage?: number;
}

export interface IJobExecutionItem {
  _id: string;
  jobId: string;
  jobName?: string;
  quantity: number;
  inputs: IJobItem[];
  outputs: IJobItem[];
  laborCosts: IJobCost[];
  overheadCosts: IJobCost[];
}

export interface IJobExecution {
  date: Date;
  jobs: IJobExecutionItem[];
  description?: string;
  inputAccountId: string;
  inputBranchId?: string;
  inputDepartmentId?: string;
  outputAccountId: string;
  outputBranchId?: string;
  outputDepartmentId?: string;
}

export interface IJobExecutionDocument extends IJobExecution, Document {
  _id: string;
  status: 'draft' | 'posting' | 'posted' | 'undoing' | 'error';
  parentId?: string;
  ptrId?: string;
  error?: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}
