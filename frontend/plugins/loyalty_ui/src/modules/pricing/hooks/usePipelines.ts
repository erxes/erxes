import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { compactList } from '@/loyalties/utils/cursorList';
import { GET_PIPELINES } from '@/pricing/graphql/queries';
import type { SalesPipelinesQuery } from '~/gql/graphql';

export type IPipeline = NonNullable<
  NonNullable<
    NonNullable<SalesPipelinesQuery['salesPipelines']>['list']
  >[number]
>;

interface UsePipelinesOptions {
  variables?: {
    boardId?: string;
  };
  skip?: boolean;
}

export const usePipelines = (options?: UsePipelinesOptions) => {
  const { data, loading, error } = useQuery(GET_PIPELINES, {
    variables: options?.variables,
    skip: options?.skip,
  });
  const pipelines = useMemo(
    () => compactList(data?.salesPipelines?.list),
    [data?.salesPipelines?.list],
  );

  return { pipelines, loading, error };
};
