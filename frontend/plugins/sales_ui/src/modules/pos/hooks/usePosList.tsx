import { useQuery } from '@apollo/client';
import queries from '../graphql/queries';
import { IPos } from '../types/pos';

const POS_PER_PAGE = 30;

export const usePosList = (options = {}) => {
  const { data, loading, fetchMore } = useQuery(
    queries.posList,
    {
      variables: {
        perPage: POS_PER_PAGE,
        ...options,
      },
    },
  );

  const transformedPosList =
    data?.posList?.map((pos:IPos) => ({
      _id: pos._id,
      name: pos.name,
      isOnline: pos.isOnline || false,
      onServer: pos.onServer || false,
      branchTitle: pos.branchTitle || '',
      departmentTitle: pos.departmentTitle || '',
      createdAt: pos.createdAt,
      createdBy: pos?.user?.details?.fullName || 'Admin'
    })) || [];

  const handleFetchMore = () => {
    if (!data?.posList) {
      return
    };

    fetchMore({
      variables: {
        page: Math.ceil(transformedPosList.length / POS_PER_PAGE) + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev
        };
        return Object.assign({}, prev, {
          posList: [...(prev.posList || []), ...fetchMoreResult.posList],
        });
      },
    });
  };

  return {
    loading,
    posList: transformedPosList,
    totalCount: data?.posList?.length || 0,
    handleFetchMore,
    pageInfo: {
      hasNextPage: transformedPosList.length < (data?.posList?.length || 0),
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
