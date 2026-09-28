import { IBranch, IDepartment, IProduct, IUser } from 'ui-modules';

interface IProductCategorySummary {
  _id: string;
  code?: string;
  name: string;
}

export type ISafeRemainder = {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;

  date: Date;
  description: string;

  status: string;
  branchId: string;
  departmentId: string;
  productCategoryId: string;

  branch: IBranch;
  department: IDepartment;
  productCategory: IProductCategorySummary;
  modifiedUser: IUser;

  incomeRule?: Record<string, unknown>;
  incomeTrId?: string;
  outRule?: Record<string, unknown>;
  outTrId?: string;
  saleRule?: Record<string, unknown>;
  saleTrId?: string;
  costIncreaseRule?: Record<string, unknown>;
  costDecreaseRule?: Record<string, unknown>;
  costIncreaseTrId?: string;
  costDecreaseTrId?: string;
};

export type TSafeRemainderItemTrInfo = {
  activeCost?: number;
  unitCost?: number;
  isCostExplicit?: boolean;
  lastIncomePrice?: number;
  isSale?: boolean;
  unitPrice?: number;
};

export type TSafeRemainderImportItem = {
  productCode: string;
  count: number;
  trInfo?: Omit<TSafeRemainderItemTrInfo, 'activeCost'>;
};

export type ISafeRemainderItem = {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
  status: string;
  remainderId: string;
  productId: string;
  uom: string;
  preCount: number;
  count: number;
  branchId: string;
  departmentId: string;

  product: IProduct;

  trInfo?: TSafeRemainderItemTrInfo;
};

export const SAFE_REMAINDER_STATUSES = {
  DRAFT: 'draft',
  DONE: 'done',
  PUBLISHED: 'published',
  ALL: ['draft', 'done', 'published'],
};

export const SAFE_REMAINDER_ITEM_STATUSES = {
  NEW: 'new',
  CHECKED: 'checked',
  ALL: ['new', 'checked'],
};
