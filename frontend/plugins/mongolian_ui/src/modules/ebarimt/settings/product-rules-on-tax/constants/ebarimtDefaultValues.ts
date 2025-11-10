export enum productCategories {
  PRODUCT = 'product',
  SERVICE = 'service',
  OTHER = 'other',
}

export enum EBarimtStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

export interface IEBarimt {
  _id?: string;
  title: string;
  productCategories: string;
  taxType: string;
  excludeCategories: string;
  taxCode: string;
  products: string;
  excludeProducts: string;
  kind: productCategories;
  percent: number;
  tags: string;
  excludeTags: string;
  status?: EBarimtStatus;
}

export const ebarimtDefaultValues: IEBarimt = {
  title: '',
  productCategories: '',
  taxType: '',
  excludeCategories: '',
  taxCode: '',
  products: '',
  excludeProducts: '',
  kind: productCategories.PRODUCT,
  percent: 0,
  tags: '',
  excludeTags: '',
  status: EBarimtStatus.ACTIVE,
};
