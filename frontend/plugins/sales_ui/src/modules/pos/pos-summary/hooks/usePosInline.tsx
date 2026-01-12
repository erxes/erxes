import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { IPos } from '../types/pos';

export const usePosInline = (options?: any) => {
  const { data, loading, error } = useQuery<{
    posDetail: IPos;
  }>(
    gql`
      query posDetail($_id: String!) {
        posDetail(_id: $_id) {
          _id
          name
        }
      }
    `,
    {
      ...options,
    },
  );

  const { posDetail } = data || {};

  return {
    posDetail,
    loading,
    error,
  };
};
