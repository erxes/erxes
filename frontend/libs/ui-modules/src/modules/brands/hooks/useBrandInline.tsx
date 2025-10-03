import { QueryHookOptions } from '@apollo/client';
import { useQuery } from '@apollo/client';
import { IBrand } from '../types/brand';
import { BRAND_INLINE_QUERY } from '../graphql/queries/BrandsQuery';

export interface IBrandInline {
  _id: string;
  name: string;
  code: string;
}

export interface IBrandInlineQuery {
  brandDetail: IBrandInline;
}

export const useBrandInline = (
  options?: QueryHookOptions<IBrandInlineQuery>,
) => {
  const { data, loading, error } = useQuery<IBrandInlineQuery>(
    BRAND_INLINE_QUERY,
    {
      ...options,
    },
  );

  return {
    brand: data?.brandDetail,
    loading,
    error,
  };
};
