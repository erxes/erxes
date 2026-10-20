import { usePosSelector } from '@/pos/hooks/usePosSelector';
import { hasId } from '@/pos/utils/posJson';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { gql } from '~/gql';
import type {
  SalesPosCoversPosListQuery,
  SalesPosCoversPosListQueryVariables,
  SalesPosCoversSelectDetailQuery,
  SalesPosCoversSelectDetailQueryVariables,
} from '~/gql/graphql';
import { POS_QUERY } from '../graphql/queries/posQuery';

export const usePos = (
  options?: QueryHookOptions<
    SalesPosCoversPosListQuery,
    SalesPosCoversPosListQueryVariables
  >,
) => usePosSelector(POS_QUERY, options);
export const usePosByIds = (
  options: QueryHookOptions<
    SalesPosCoversSelectDetailQuery,
    SalesPosCoversSelectDetailQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(
    gql(`
      query salesPosCoversSelectDetail($_id: String!) {
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
