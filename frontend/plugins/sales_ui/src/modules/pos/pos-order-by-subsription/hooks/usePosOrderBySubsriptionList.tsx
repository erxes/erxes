import { useMemo } from 'react';
import { hasId } from '@/pos/utils/posJson';
import { toPosSubscriptionRow, readPosData } from '@/pos/utils/posOrderJson';
import { useQuery } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';
import type { PosOrderBySubscriptionsQueryVariables } from '~/gql/graphql';
import { POS_ORDER_BY_SUBSCRIPTION } from '~/modules/pos/pos-order-by-subsription/graphql/queries/queries';

const POS_PER_PAGE = 30;

type UsePosOrderBySubscriptionOptions =
  PosOrderBySubscriptionsQueryVariables & { posId?: string };

export const usePosOrderBySubscriptionVariables = (
  options: UsePosOrderBySubscriptionOptions = {},
) => {
  const { posId, ...otherOptions } = options;

  const [{ customer, company, user }] = useMultiQueryState<{
    customer: string;
    company: string;
    user: string;
  }>(['customer', 'company', 'user']);

  return {
    perPage: POS_PER_PAGE,
    ...(posId && { posId }),
    customerId: customer || undefined,
    companyId: company || undefined,
    userId: user || undefined,
    ...otherOptions,
  };
};

export const usePosOrderBySubscriptionList = (
  options: UsePosOrderBySubscriptionOptions = {},
) => {
  const variables = usePosOrderBySubscriptionVariables(options);

  const { data, loading, error, fetchMore } = useQuery(
    POS_ORDER_BY_SUBSCRIPTION,
    {
      variables,
    },
  );

  const parsed = useMemo(
    () =>
      readPosData(() =>
        (data?.posOrderBySubscriptions ?? [])
          .filter(hasId)
          .map(toPosSubscriptionRow),
      ),
    [data?.posOrderBySubscriptions],
  );
  const posOrderBySubscriptionList = parsed.value ?? [];

  const totalCount = 0;

  const handleFetchMore = () => {
    if (!data?.posOrderBySubscriptions) {
      return;
    }

    fetchMore({
      variables: {
        ...variables,
        page: Math.ceil(posOrderBySubscriptionList.length / POS_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return Object.assign({}, prev, {
          posOrderBySubscriptions: [
            ...(prev.posOrderBySubscriptions || []),
            ...(fetchMoreResult.posOrderBySubscriptions ?? []),
          ],
        });
      },
    });
  };

  return {
    loading,
    error: error ?? parsed.error,
    posOrderBySubscriptionList,
    totalCount,
    handleFetchMore,
    pageInfo: {
      hasNextPage: posOrderBySubscriptionList.length < totalCount,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
