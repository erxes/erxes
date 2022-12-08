import { IProductsDataDocument } from './jobs';

export interface IOverallProductsData {
  productId: string;
  quantity: number;
  uomId: string;
}

export interface IOverallWork {
  _id: string;
  key: {
    inBranchId: string;
    inDepartmentId: string;
    outBranchId: string;
    outDepartmentId: string;
    type: string;
    typeId: string;
  };
  status: string;
  dueDate: Date;
  startAt: Date;
  endAt: Date;
  assignUserIds: string[];
  jobId: string;
  flowId: string;
  intervalId?: string;
  needProducts?: IProductsDataDocument[][];
  resultProducts?: IProductsDataDocument[][];
}
