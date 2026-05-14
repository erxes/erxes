import { ICheckCategory } from './checkCategory';

export type CategoryStatus = 'create' | 'update' | 'delete' | 'synced';

export interface CategoryItem extends ICheckCategory {
  status: CategoryStatus;
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
}
