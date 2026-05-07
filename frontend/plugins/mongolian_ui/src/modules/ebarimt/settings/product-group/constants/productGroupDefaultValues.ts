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

export interface IProductGroup {
  _id?: string;
  mainProductId: string;
  subProductId: string;
  mainProduct?: { _id: string; name: string; code?: string };
  subProduct?: { _id: string; name: string; code?: string };
  sortNum: number;
  ratio: number;
  isActive: boolean;
  status?: ProductGroupStatus;
}

export const productGroupDefaultValues: IProductGroup = {
  mainProductId: ProductCategory.PRODUCT,
  subProductId: ProductCategory.SERVICE,
  sortNum: 0,
  ratio: 0,
  isActive: true,
  status: ProductGroupStatus.ACTIVE,
};
