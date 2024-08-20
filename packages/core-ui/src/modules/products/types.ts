import {
  IProduct as IProductC,
  IProductCategory as IProductCategoryC,
  IProductDoc as IProductDocC,
  IUom as IUomC
} from '@erxes/ui-products/src/types';
import { QueryResponse } from '@erxes/ui/src/types';

export type IProductDoc = IProductDocC & {};

export type IProduct = IProductC & {};

export type IProductCategory = IProductCategoryC & {};

export type IUom = IUomC & {};

export type Counts = {
  [key: string]: number;
};
type ProductCounts = {
  bySegment: Counts;
  byTag: Counts;
};
// query types

export type ProductsQueryResponse = {
  products: IProduct[];
} & QueryResponse;

export type ProductsCountQueryResponse = {
  productsTotalCount: number;
} & QueryResponse;

export type ProductsGroupCountsQueryResponse = {
  productsGroupsCounts: ProductCounts;
} & QueryResponse;

export type ProductCategoriesCountQueryResponse = {
  productCategoriesTotalCount: number;
} & QueryResponse;

// UOM
export type UomsCountQueryResponse = {
  uomsTotalCount: number;
} & QueryResponse;

export type MutationUomVariables = {
  _id?: string;
  name: string;
  code: string;
};

export type UomAddMutationResponse = {
  uomsAdd: (mutation: { variables: MutationUomVariables }) => Promise<any>;
};

export type UomEditMutationResponse = {
  uomsEdit: (mutation: { variables: MutationUomVariables }) => Promise<any>;
};

export type UomRemoveMutationResponse = {
  uomsRemove: (mutation: { variables: { uomIds: string[] } }) => Promise<any>;
};

export type MutationVariables = {
  _id?: string;
  type: string;
  name?: string;
  description?: string;
  uom?: string;
  createdAt?: Date;
};

// mutation types

export type AddMutationResponse = {
  addMutation: (mutation: { variables: MutationVariables }) => Promise<any>;
};

export type EditMutationResponse = {
  editMutation: (mutation: { variables: MutationVariables }) => Promise<any>;
};

export type ProductRemoveMutationResponse = {
  productsRemove: (mutation: {
    variables: { productIds: string[] };
  }) => Promise<any>;
};

export type ProductCategoryRemoveMutationResponse = {
  productCategoryRemove: (mutation: {
    variables: { _id: string };
  }) => Promise<any>;
};

export type DetailQueryResponse = {
  productDetail: IProduct;
  loading: boolean;
};

export type CategoryDetailQueryResponse = {
  productCategoryDetail: IProductCategory;
  loading: boolean;
};

export type CountByTagsQueryResponse = {
  productCountByTags: { [key: string]: number };
  loading: boolean;
};

export type MergeMutationVariables = {
  productIds: string[];
  productFields: IProduct;
};

export type MergeMutationResponse = {
  productsMerge: (params: {
    variables: MergeMutationVariables;
  }) => Promise<any>;
};

// SETTINGS

export type IConfigsMap = { [key: string]: any };

export type IProductsConfig = {
  _id: string;
  code: string;
  value: any;
};

export type BarcodeConfig = {
  row: number;
  column: number;
  width: number;
  height: number;
  margin: number;
  isDate: boolean;
  date: number;
  isProductName: boolean;
  productNameFontSize: number;
  isPrice: boolean;
  priceFontSize: number;

  isBarcode: boolean;
  isBarcodeDescription: boolean;
  barWidth: number;
  barHeight: number;
  barcodeFontSize: number;
  barcodeDescriptionFontSize: number;

  isQrcode: boolean;
  qrSize: number;
};

// query types
export type ProductsConfigsQueryResponse = {
  productsConfigs: IProductsConfig[];
  loading: boolean;
  refetch: () => void;
};
