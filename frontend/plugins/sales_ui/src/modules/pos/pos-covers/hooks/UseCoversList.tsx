import { useQuery } from '@apollo/client';
import queries from '../graphql/queries';

interface ICovers {
  _id: string;
  posToken: string;
  status: string;
  beginDate: string;
  endDate: string;
  description: string;
  userId: string;
  note: string;
  posName: string;
  createdAt: string;
  createdUser?: {
    email: string;
  };
}

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
