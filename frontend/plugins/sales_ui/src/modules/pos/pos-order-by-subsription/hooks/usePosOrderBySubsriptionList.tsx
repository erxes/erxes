import { useQuery } from '@apollo/client';
import { POS_ORDER_BY_SUBSCRIPTION } from '~/modules/pos/pos-order-by-subsription/graphql/queries/queries';
import { useMultiQueryState } from 'erxes-ui';

const POS_PER_PAGE = 30;

interface UsePosOrderBySubscriptionOptions {
  posId?: string;
  [key: string]: any;
}

interface UsePosOrderBySubscriptionReturn {
  loading: boolean;
  posOrderBySubscriptionList: any[];
  totalCount: number;
  handleFetchMore: () => void;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: null;
    endCursor: null;
  };
}

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
): UsePosOrderBySubscriptionReturn => {
  const variables = usePosOrderBySubscriptionVariables(options);

  const { data, loading, fetchMore } = useQuery(POS_ORDER_BY_SUBSCRIPTION, {
    variables,
  });

  const posOrderBySubscriptionList = data?.PosOrderBySubscriptions || [];

  const totalCount = data?.PosOrderBySubscriptionsTotalCount || 0;

  const handleFetchMore = () => {
    if (!data?.PosOrderBySubscriptions) {
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
          PosOrderBySubscriptions: [
            ...(prev.PosOrderBySubscriptions || []),
            ...fetchMoreResult.PosOrderBySubscriptions,
          ],
        });
      },
    });
  };

  return {
    loading,
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
