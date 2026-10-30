import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CYCLE_INLINE } from '@/cycle/graphql/queries/getCycle';
import type {
  GetCycleInlineQuery,
  GetCycleInlineQueryVariables,
} from '~/gql/graphql';

export const useGetCycleInline = (
  cycleId?: string | null,
  options?: Omit<
    QueryHookOptions<GetCycleInlineQuery, GetCycleInlineQueryVariables>,
    'variables'
  >,
) => {
  const { data, loading } = useQuery(GET_CYCLE_INLINE, {
    ...options,
    variables: cycleId ? { _id: cycleId } : undefined,
    skip: !cycleId || options?.skip,
  });

  return { cycle: data?.getCycle, loading };
};
