import { Document } from 'mongoose';

export interface IJobItem {
  productId: string;
  uom?: string;
  quantity: number;
  costRatio?: number;
}

export interface IJobCost {
  name: string;
  amount: number;
  accountId: string;
}

export interface IJob {
  code?: string;
  name: string;
  description?: string;
  duration?: number;
  durationType?: string;
  laborCosts?: IJobCost[];
  overheadCosts?: IJobCost[];
  inputs: IJobItem[];
  outputs: IJobItem[];
  status?: string;
}

export interface IJobDocument extends IJob, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}

export interface IJobListParams {
  searchValue?: string;
  status?: string;
  laborCostName?: string;
  overheadCostName?: string;
  hasLabor?: boolean;
  hasOverhead?: boolean;
  inputProductId?: string;
  outputProductId?: string;
  durationType?: string;
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

export interface IJobOutputRow {
  _id: string;
  job: IJobDocument;
  output: IJobItem;
  outputIndex: number;
}

export interface IJobOutputListParams extends IJobListParams {
  duplicatedOutput?: boolean;
}
