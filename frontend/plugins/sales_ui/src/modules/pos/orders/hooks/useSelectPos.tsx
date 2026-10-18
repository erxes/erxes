import { usePosSelector } from '@/pos/hooks/usePosSelector';
import { hasId } from '@/pos/utils/posJson';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { gql } from '~/gql';
import type {
  SalesPosOrdersPosListQuery,
  SalesPosOrdersPosListQueryVariables,
  SalesPosOrdersSelectDetailQuery,
  SalesPosOrdersSelectDetailQueryVariables,
} from '~/gql/graphql';
import { POS_QUERY } from '../graphql/queries/posQuery';

export const usePos = (
  options?: QueryHookOptions<
    SalesPosOrdersPosListQuery,
    SalesPosOrdersPosListQueryVariables
  >,
) => usePosSelector(POS_QUERY, options);
export const usePosByIds = (
  options: QueryHookOptions<
    SalesPosOrdersSelectDetailQuery,
    SalesPosOrdersSelectDetailQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(
    gql(`
      query salesPosOrdersSelectDetail($_id: String!) {
        posDetail(_id: $_id) {
          _id
          name
          description
          token
          user {
            _id
            details {
              fullName
              avatar
            }
          }
          branchTitle
          departmentTitle
          isOnline
          onServer
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
