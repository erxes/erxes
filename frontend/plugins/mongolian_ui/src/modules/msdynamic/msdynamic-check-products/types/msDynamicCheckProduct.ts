export type MSDynamicCheckProductStatus = 'create' | 'update' | 'delete';

export type MSDynamicProductAction = 'CREATE' | 'UPDATE' | 'DELETE';

export type MSDynamicCheckProduct = Record<string, unknown> & {
  status: MSDynamicCheckProductStatus;
  isSynced: boolean;
  syncStatus?: boolean;
  Common_Item_No?: string;
  No?: string;
  Description?: string;
  Unit_Price?: number | string;
  code?: string;
  name?: string;
  unitPrice?: number | string;
  barcodes?: string;
  Barcodes?: string;
  displayCode: string;
  displayName: string;
  displayUnitPrice: number | string;
  displayBarcodes: string;
};

export type MSDynamicCheckProductsResponse = Partial<
  Record<MSDynamicCheckProductStatus, { items?: MSDynamicCheckProductSource[] }>
> & {
  matched?: { count?: number };
};

export type MSDynamicCheckProductSource = Record<string, unknown> & {
  syncStatus?: boolean;
  Common_Item_No?: string;
  No?: string;
  Description?: string;
  Unit_Price?: number | string;
  code?: string;
  name?: string;
  unitPrice?: number | string;
  barcodes?: string;
  Barcodes?: string;
};

export type MSDynamicBrand = {
  _id: string;
  name?: string;
};

export const MSDYNAMIC_PRODUCT_ACTIONS: Record<
  MSDynamicCheckProductStatus,
  MSDynamicProductAction
> = {
  create: 'CREATE',
  update: 'UPDATE',
  delete: 'DELETE',
};

export const MSDYNAMIC_PRODUCT_FILTER_LABELS: Record<
  MSDynamicCheckProductStatus,
  string
> = {
  create: 'Create products',
  update: 'Update products',
  delete: 'Delete products',
};
