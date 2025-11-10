import { useQuery } from '@apollo/client';
import queries from '@/pos/pos-covers/graphql/queries';
import { ICovers } from '@/pos/pos-covers/types/posCover';

const COVERS_PER_PAGE = 30;

export const useCoversList = (options = {}) => {
  const { data, loading, fetchMore } = useQuery(queries.posCovers, {
    variables: {
      perPage: COVERS_PER_PAGE,
      ...options,
    },
  });
  const transformedCoversList =
    data?.posCovers?.map((cover: ICovers) => ({
      _id: cover._id,
      name: cover.posName,
      status: cover.status,
      beginDate: cover.beginDate,
      endDate: cover.endDate,
      description: cover.description,
      note: cover.note,
      createdAt: cover.createdAt,
      createdBy: cover?.createdUser?.email || 'Unknown',
    })) || [];

  const handleFetchMore = () => {
    if (!data?.posCovers) {
      return;
    }

    fetchMore({
      variables: {
        page: Math.ceil(transformedCoversList.length / COVERS_PER_PAGE) + 1,
        perPage: COVERS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return Object.assign({}, prev, {
          posCovers: [...(prev.posCovers || []), ...fetchMoreResult.posCovers],
        });
      },
    });
  };

  return {
    loading,
    coversList: transformedCoversList,
    totalCount: data?.posCovers?.length || 0,
    handleFetchMore,
    pageInfo: {
      hasNextPage:
        transformedCoversList.length < (data?.posCovers?.length || 0),
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
