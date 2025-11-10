import { useQuery } from '@apollo/client';
import { POS_BY_ITEMS_QUERY } from '@/pos/pos-by-items/graphql/queries';
import { IProduct } from '@/pos/pos-by-items/types/PosByItemType';

const POS_PER_PAGE = 30;

export const usePosByItemsList = (options: { posId?: string } = {}) => {
  const { posId, ...otherOptions } = options;

  const variables: any = {
    perPage: POS_PER_PAGE,
    ...otherOptions,
  };

  if (posId) {
    variables.posId = posId;
  }

  const { data, loading, fetchMore } = useQuery(POS_BY_ITEMS_QUERY, {
    variables,
  });

  const transformedPosList =
    data?.posProducts?.products?.map((product: IProduct) => ({
      ...product,
    })) || [];

  const handleFetchMore = () => {
    if (!data?.posProducts) {
      return;
    }
    fetchMore({
      variables: {
        ...variables,
        page: Math.ceil(transformedPosList.length / POS_PER_PAGE) + 1,
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        return Object.assign({}, prev, {
          posProducts: [
            ...(prev.posProducts || []),
            ...fetchMoreResult.posProducts,
          ],
        });
      },
    });
  };

  return {
    loading,
    posByItemsList: transformedPosList,
    totalCount: data?.posProducts?.totalCount || 0,
    handleFetchMore,
    pageInfo: {
      hasNextPage:
        transformedPosList.length < (data?.posProducts?.totalCount || 0),
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
