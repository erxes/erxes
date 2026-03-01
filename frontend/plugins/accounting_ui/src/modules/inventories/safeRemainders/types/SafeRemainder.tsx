import {
  IBranch,
  IDepartment,
  IProduct,
  IProductCategory,
  IUser,
} from 'ui-modules';

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
  productCategory: IProductCategory;
  modifiedUser: IUser;
};

export type ISafeRemainderItem = {
  _id: string;
  modifiedAt: Date;
  status: string;
  remainderId: string;
  productId: string;
  uom: string;
  preCount: number;
  count: number;
  branchId: string;
  departmentId: string;

  product: IProduct;
};

export const SAFE_REMAINDER_STATUSES = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ALL: ['draft', 'published'],
};

export const SAFE_REMAINDER_ITEM_STATUSES = {
  NEW: 'new',
  CHECKED: 'checked',
  ALL: ['new', 'checked'],
};
