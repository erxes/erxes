import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_TOUR_DETAIL } from '../graphql/queries';
import type {
  BmsTourDetailQuery,
  BmsTourDetailQueryVariables,
} from '~/gql/graphql';

export type ITourDetail = NonNullable<BmsTourDetailQuery['bmsTourDetail']>;

export type IPricingOption = NonNullable<
  NonNullable<ITourDetail['pricingOptions']>[number]
>;

export type ITourTranslation = NonNullable<
  NonNullable<ITourDetail['translations']>[number]
>;

export type IPricingOptionTranslation = NonNullable<
  NonNullable<ITourTranslation['pricingOptions']>[number]
>;

export type ITourGuide = NonNullable<
  NonNullable<ITourDetail['guides']>[number]
>;

export const useTourDetail = (
  options?: QueryHookOptions<BmsTourDetailQuery, BmsTourDetailQueryVariables>,
) => {
  const { data, loading, error, refetch } = useQuery(GET_TOUR_DETAIL, options);

  return {
    loading,
    error,
    refetch,
    tourDetail: data?.bmsTourDetail,
  };
};
