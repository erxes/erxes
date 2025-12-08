import { useQuery, QueryHookOptions, OperationVariables } from '@apollo/client';
import { gql } from '@apollo/client';

import { POS_QUERY } from '../graphql/queries/posQuery';

import { IPos } from '../types/pos';

const POS_PER_PAGE = 20;

export const usePos = (options?: QueryHookOptions<{ posList: IPos[] }>) => {
  const { data, loading, error, fetchMore } = useQuery<{ posList: IPos[] }>(
    POS_QUERY,
    {
      ...options,
      variables: {
        perPage: POS_PER_PAGE,
        page: 1,
        ...options?.variables,
      },
    },
  );

  const posList = data?.posList || [];

  const handleFetchMore = () => {
    const currentPage = Math.floor(posList.length / POS_PER_PAGE) + 1;

    fetchMore({
      variables: {
        page: currentPage + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          posList: [...prev.posList, ...fetchMoreResult.posList],
        };
      },
    });
  };

  return {
    posList,
    loading,
    error,
    handleFetchMore,
    totalCount: posList.length,
  };
};
export const usePosByIds = (options: OperationVariables) => {
  const { data, loading, error } = useQuery<{
    posDetail: IPos;
  }>(
    gql`
      query posDetail($_id: String!) {
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
