export enum ProductCategory {
  PRODUCT = 'product',
  SERVICE = 'service',
  OTHER = 'other',
}

export enum ProductGroupStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export interface IProductGroupProduct {
  _id: string;
  name: string;
  code?: string;
}

export interface IProductGroup {
  _id?: string;
  mainProductId: string;
  subProductId: string;
  mainProduct?: IProductGroupProduct;
  subProduct?: IProductGroupProduct;
  sortNum: number;
  ratio: number;
  isActive: boolean;
  status?: ProductGroupStatus;
}

export const productGroupDefaultValues: IProductGroup = {
  mainProductId: '',
  subProductId: '',
  sortNum: 0,
  ratio: 0,
  isActive: true,
  status: ProductGroupStatus.ACTIVE,
};
