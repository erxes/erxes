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
  mainProducts: ProductCategory;
  subProducts: ProductCategory;
  sortNumber: number;
  ratio: number;
  isActive: boolean;
  status?: ProductGroupStatus;
}

// ✅ Default утгууд
export const productGroupDefaultValues: IProductGroup = {
  mainProducts: ProductCategory.PRODUCT,
  subProducts: ProductCategory.SERVICE,
  sortNumber: 0,
  ratio: 0,
  isActive: true,
  status: ProductGroupStatus.ACTIVE,
};
