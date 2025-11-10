export interface ICategory {
  _id: string;
  code: string;
  name: string;
  __typename: string;
}

export interface IProduct {
  _id: string;
  name: string;
  type: string;
  code: string;
  categoryId: string;
  unitPrice: number;
  category: ICategory;
  counts: number;
  count: number;
  amount: number;
  __typename: string;
}

export interface IPosProductsResponse {
  products: IProduct[];
  totalCount: number;
  __typename: string;
}

export type IPosByItems = IProduct;
