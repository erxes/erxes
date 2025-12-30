import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  parseDateRangeFromString,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { checkPosOrdersQuery } from '../graphql/queries/checkPosOrdersQuery';
import { ICheckPosOrders } from '../types/checkPosOrders';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { checkPosOrdersTotalCountAtom } from '../states/checkPosOrdersDealsCounts';

export const CHECK_POS_ORDERS_PER_PAGE = 30;

export const useCheckPosOrdersVariables = (
  variables?: QueryHookOptions<ICheckPosOrders[]>['variables'],
) => {
  const [
    { posToken, pos, user, paidDateRange, createdDateRange, searchValue },
  ] = useMultiQueryState<{
    posToken: string;
    pos: string;
    user: string;
    paidDateRange: string;
    createdDateRange: string;
    searchValue: string;
  }>([
    'posToken',
    'pos',
    'user',
    'paidDateRange',
    'createdDateRange',
    'searchValue',
  ]);
  const [number] = useQueryState<string>('number');

  const paidDateParsed = paidDateRange
    ? parseDateRangeFromString(paidDateRange)
    : null;
  const createdDateParsed = createdDateRange
    ? parseDateRangeFromString(createdDateRange)
    : null;

  const finalVariables = {
    perPage: CHECK_POS_ORDERS_PER_PAGE,
    sortField: 'createdAt',
    sortDirection: -1,
    search: (() => {
      const searchParts = [];
      if (searchValue) searchParts.push(searchValue);
      if (number) searchParts.push(number);
      return searchParts.length > 0 ? searchParts.join(' ') : undefined;
    })(),
    posId: pos || undefined, 
    userId: user || undefined,
    ...(posToken && { posToken }),
    ...(paidDateParsed && {
      paidStartDate: paidDateParsed.from,
      paidEndDate: paidDateParsed.to,
    }),
    ...(createdDateParsed && {
      createdStartDate: createdDateParsed.from,
      createdEndDate: createdDateParsed.to,
    }),
    ...variables,
  };

  return finalVariables;
};

export const useCheckPosOrders = (options?: QueryHookOptions) => {
  const setCheckPosOrdersTotalCount = useSetAtom(checkPosOrdersTotalCountAtom);
  const variables = useCheckPosOrdersVariables(options?.variables);

  const { data, loading, fetchMore } = useQuery(checkPosOrdersQuery, {
    ...options,
    variables,
    fetchPolicy: 'cache-and-network',
  });

  const checkPosOrders = data?.posOrders || [];
  const totalCount = data?.posOrdersTotalCount || 0;

  useEffect(() => {
    if (!totalCount) return;
    setCheckPosOrdersTotalCount(totalCount);
  }, [totalCount, setCheckPosOrdersTotalCount]);

  const handleFetchMore = () => {
    const currentPage = Math.ceil(
      checkPosOrders.length / CHECK_POS_ORDERS_PER_PAGE,
    );

    fetchMore({
      variables: {
        ...variables,
        page: currentPage + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return {
          posOrders: [...prev.posOrders, ...fetchMoreResult.posOrders],
          posOrdersTotalCount: fetchMoreResult.posOrdersTotalCount,
        };
      },
    });
  };

  return {
    loading,
    checkPosOrders,
    totalCount,
    handleFetchMore,
    pageInfo: {
      hasNextPage: checkPosOrders.length < totalCount,
      hasPreviousPage: false,
    },
  };
};
