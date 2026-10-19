import { useMemo } from 'react';
import { hasId } from '@/pos/utils/posJson';
import { toPosCustomerRow, readPosData } from '@/pos/utils/posOrderJson';
import { useQuery } from '@apollo/client';
import type { PosOrderCustomersQueryVariables } from '~/gql/graphql';
import { POS_ORDERS_BY_CUSTOMER } from '../graphql/queries/queries';

const POS_PER_PAGE = 30;

export const usePosOrderByCustomerList = (options: { posId?: string } = {}) => {
  const { posId, ...otherOptions } = options;

  const variables: PosOrderCustomersQueryVariables = {
    perPage: POS_PER_PAGE,
    ...otherOptions,
  };

  const { data, loading, error, fetchMore } = useQuery(POS_ORDERS_BY_CUSTOMER, {
    variables,
  });

  const parsed = useMemo(
    () =>
      readPosData(() =>
        (data?.posOrderCustomers ?? []).filter(hasId).map(toPosCustomerRow),
      ),
    [data?.posOrderCustomers],
  );
  const transformedPosList = parsed.value ?? [];

  const handleFetchMore = () => {
    if (!data?.posOrderCustomers) {
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
          posOrderCustomers: [
            ...(prev.posOrderCustomers || []),
            ...(fetchMoreResult.posOrderCustomers ?? []),
          ],
        });
      },
    });
  };

  return {
    loading,
    error: error ?? parsed.error,
    posOrderByCustomerList: transformedPosList,
    totalCount: 0,
    handleFetchMore,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
