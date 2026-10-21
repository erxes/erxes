import { QueryHookOptions, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { gql } from '~/gql';
import type {
  ErkhetPosInlineDetailQuery,
  ErkhetPosInlineDetailQueryVariables,
} from '~/gql/graphql';
import { toPos } from '../types/pos';

const POS_DETAIL_QUERY = gql(`
  query erkhetPosInlineDetail($_id: String!) {
    posDetail(_id: $_id) {
      _id
      name
      description
      pdomain
      createdAt
      token
      adminIds
      cashierIds
      isOnline
      onServer
      branchId
      departmentId
      allowBranchIds
      beginNumber
    }
  }
`);

export const usePosInline = (
  options?: QueryHookOptions<
    ErkhetPosInlineDetailQuery,
    ErkhetPosInlineDetailQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(POS_DETAIL_QUERY, {
    ...options,
  });

  // Keep the reference stable: PosInline's effect depends on posDetail.
  const posDetail = useMemo(
    () => (data?.posDetail ? toPos(data.posDetail)[0] : undefined),
    [data?.posDetail],
  );

  return {
    posDetail,
    loading,
    error,
  };
};
