export type InventoryCategoryAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type CategoryFilterType = 'create' | 'update' | 'delete';

export interface InventoryCategoryItem {
  _id?: string;
  Code?: string;
  Name?: string;
  Description?: string;
  code?: string;
  name?: string;
  description?: string;
  syncStatus?: boolean;
}

export interface InventoryCategoryItems {
  create?: { items?: InventoryCategoryItem[] };
  update?: { items?: InventoryCategoryItem[] };
  delete?: { items?: InventoryCategoryItem[] };
}
