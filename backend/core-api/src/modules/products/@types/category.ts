export interface IProductCategoryParams {
  parentId: string;
  searchValue: string;
  status: string;
  withChild: boolean;
  brandIds: string;
  meta: string | number;
  ids: string[];
}
