export interface IAccount {
  code: string;
  name: string;
  categoryId?: string;
  parentId?: string;
  currency: string;
  kind: string;
  journal: string;
  description?: string;
  branchId?: string;
  departmentId?: string;
  scopeBrandIds?: string[];
  status: string;
  isOutBalance: boolean;
  mergedIds?: string[];
}

export interface IAccountDocument extends IAccount {
  _id: string;
  createdAt: Date;
}