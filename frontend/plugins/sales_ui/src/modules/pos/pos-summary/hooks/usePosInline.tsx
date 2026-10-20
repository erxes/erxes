import { hasId } from '@/pos/utils/posJson';
import type { QueryHookOptions } from '@apollo/client';
import { useQuery } from '@apollo/client';
import { gql } from '~/gql';
import type {
  SalesPosSummaryInlineDetailQuery,
  SalesPosSummaryInlineDetailQueryVariables,
} from '~/gql/graphql';

export const usePosInline = (
  options?: QueryHookOptions<
    SalesPosSummaryInlineDetailQuery,
    SalesPosSummaryInlineDetailQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(
    gql(`
      query salesPosSummaryInlineDetail($_id: String!) {
        posDetail(_id: $_id) {
          _id
          name
        }
      }
    `),
    {
      ...options,
    },
  );

  const { posDetail } = data || {};

  return {
    posDetail: hasId(posDetail) ? posDetail : undefined,
    loading,
    error,
  };
};
