import { QueryHookOptions, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import {
  EnumCursorDirection,
  isUndefinedOrNull,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { queries } from '../../graphql';
import { useMSDynamicSessionKey } from '../../hooks/useMSDynamicSessionKey';
import { msdynamicCheckOrderTotalCountAtom } from '../states/MSDynamicCheckOrderCounts';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/shared/utils/cursorList';
import type {
  MsdynamicPosOrdersListQuery,
  MsdynamicPosOrdersListQueryVariables,
} from '~/gql/graphql';

export const MS_DYNAMIC_CHECK_ORDERS_PER_PAGE = 20;

type TMSDynamicCheckOrderQueryOptions = QueryHookOptions<
  MsdynamicPosOrdersListQuery,
  MsdynamicPosOrdersListQueryVariables
>;

/** Check order list query variable beldene. */
export const useMSDynamicCheckOrderVariables = (
  variables?: TMSDynamicCheckOrderQueryOptions['variables'],
) => {
  const [{ brandId, user, paidDateRange, createdAtRange, number }] =
    useMultiQueryState<{
      brandId: string;
      user: string;
      paidDateRange: string;
      createdAtRange: string;
      number: string;
    }>(['brandId', 'user', 'paidDateRange', 'createdAtRange', 'number']);

  const paidRange = parseDateRangeFromString(paidDateRange);
  const createdRange = parseDateRangeFromString(createdAtRange);
  const { sessionKey } = useMSDynamicSessionKey('syncedOrders');
  const { cursor } = useRecordTableCursor({ sessionKey });

  return {
    limit: MS_DYNAMIC_CHECK_ORDERS_PER_PAGE,
    orderBy: { createdAt: -1 },
    cursor,
    search: String(number ?? '') || undefined,
    userId: user || undefined,
    brandId: brandId || undefined,
    paidStartDate: paidRange?.from,
    paidEndDate: paidRange?.to,
    createdStartDate: createdRange?.from,
    createdEndDate: createdRange?.to,
    ...variables,
  };
};

/** Msdynamic check orders cursor-toi avna. */
export const useMSDynamicCheckOrder = (
  options?: TMSDynamicCheckOrderQueryOptions,
) => {
  const setTotalCount = useSetAtom(msdynamicCheckOrderTotalCountAtom);
  const variables = useMSDynamicCheckOrderVariables(options?.variables);

  const { data, loading, fetchMore } = useQuery(queries.posOrdersList, {
    ...options,
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    variables,
    fetchPolicy: 'network-only',
  });

  const orders = compactList(data?.posOrdersList?.list);
  const totalCount = data?.posOrdersList?.totalCount;
  const pageInfo = toCursorPageInfo(data?.posOrdersList?.pageInfo);

  useEffect(() => {
    setTotalCount(totalCount ?? null);
  }, [setTotalCount, totalCount]);

  /** Table deer next/prev page avah heseg. */
  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: MS_DYNAMIC_CHECK_ORDERS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.posOrdersList || !prev.posOrdersList) {
          return prev;
        }

        return {
          ...prev,
          posOrdersList: mergeCursorList(
            direction,
            prev.posOrdersList,
            fetchMoreResult.posOrdersList,
          ),
        };
      },
    });
  };

  return {
    loading,
    orders,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
