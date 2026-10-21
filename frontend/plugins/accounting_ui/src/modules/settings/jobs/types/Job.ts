import { z } from 'zod';
import { getJobFormSchema } from './jobFormSchema';

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
  _id: string;
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

export type TJobForm = z.infer<ReturnType<typeof getJobFormSchema>>;

export interface IJobOutputRow {
  _id: string;
  job: IJob;
  output: IJobItem;
  outputIndex: number;
}
