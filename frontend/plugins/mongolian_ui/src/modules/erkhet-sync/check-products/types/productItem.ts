import { ICheckProduct } from './checkProduct';

export type ProductStatus = 'create' | 'update' | 'delete' | 'synced';

export interface ProductItem extends ICheckProduct {
  status: ProductStatus;
  isSynced?: boolean;
  name: string;
  code: string;
  parent?: string;
  is_citytax?: boolean;
  is_raw?: boolean;
  citytax_row?: string;
  is_service?: boolean;
  is_sellable?: boolean;
  order?: string;
  parent_code?: string;
  id?: string;
  bulk_price?: number;
  category_code?: string;
  measure_unit_code?: string;
  extra?: string;
  vat_type_code?: string;
  ratio_measure_unit?: number;
  sub_measure_unit_code?: string;
  barcodes?: string;
  category?: number;
  group?: string;
  unit_price?: number;
  brand_code?: string;
  sub_measure_unit?: string;
  united_code?: string;
  measure_unit?: number;
  brand?: string;
  vat_type?: string;
  nickname?: string;
  group_code?: string;
  is_deleted?: boolean;
}
