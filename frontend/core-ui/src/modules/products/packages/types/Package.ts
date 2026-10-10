export interface IPackageProduct {
  productId: string;
  quantity: number;
}

export interface IPackage {
  _id: string;
  name?: string;
  description?: string;
  coverImage?: string;
  products?: IPackageProduct[];
  tagIds?: string[];
  price?: number;
  percent?: number;
  totalPrice?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const PACKAGE_STATUSES = ['draft', 'active'] as const;

export const PACKAGE_STATUS_OPTIONS = [
  { value: 'draft', labelKey: 'status-draft' },
  { value: 'active', labelKey: 'status-active' },
] as const;

export type PackageStatus = (typeof PACKAGE_STATUSES)[number];
