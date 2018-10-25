export interface IBrand {
  _id: string;
  code: string;
  name?: string;
  createdAt: string;
  description?: string;
  emailConfig: { type: string; template: string };
}

export interface IBrandsCount {
  brandsTotalCount: number;
}

// queries

export type BrandsQueryResponse = {
  brands: IBrand[];
  loading: boolean;
  refetch: () => void;
};

export type BrandDetailQueryResponse = {
  brandDetail: IBrand;
  loading: boolean;
  refetch: () => void;
};

export type BrandsGetLastQueryResponse = {
  brandsGetLast: IBrand;
  loading: boolean;
  refetch: () => void;
};
