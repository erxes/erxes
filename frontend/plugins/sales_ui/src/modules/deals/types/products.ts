import { IProduct } from "ui-modules";

export interface IProductRecord {
  _id: string;
  name?: string;
  quantity: number;
  discountPercent: number;
  discount: number;
  unitPrice: number;
  tickUsed?: boolean;
  isVatApplied?: boolean;
  tax: number;
  amount: number;
  branchId?: string;
  departmentId?: string;
  assignedUserId?: string;
  product: IProduct;
}