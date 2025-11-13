import { useQuery } from '@apollo/client';
import queries from '@/pos/pos-summary/graphql/queries';
import { IPosSummary } from '@/pos/pos-summary/types/posSummary';

const POS_PER_PAGE = 20;

export const usePosSummaryList = (options: { posId?: string } = {}) => {
  const { posId, ...otherOptions } = options;

  const variables: any = {
    perPage: POS_PER_PAGE,
    ...otherOptions,
  };
  if (posId) {
    variables.posId = posId;
  }

  const { data, loading, fetchMore } = useQuery(
    queries.POS_ORDER_GROUP_SUMMARY,
    { variables },
  );

  const transformedPosList: IPosSummary[] =
    data?.posOrdersGroupSummary?.amounts?.map((item: any) => ({
      _id: item._id,
      paidDate: item.paidDate || 'N/A',
      number: item._id,
      billId: '',
      cashAmount: item.cashAmount || 0,
      mobileAmount: item.mobileAmount || 0,
      totalAmount: item.totalAmount || 0,
      finalAmount: item.finalAmount || 0,
      amounts: {
        count: item.count || 0,
        cashAmount: item.cashAmount || 0,
        mobileAmount: item.mobileAmount || 0,
        invoice: item.invoice || 0,
      },
    })) || [];

  const handleFetchMore = () => {
    if (!data?.posOrdersGroupSummary?.amounts?.length) return;

    fetchMore({
      variables: {
        perPage: POS_PER_PAGE,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }
        return {
          posOrdersGroupSummary: {
            amounts: [
              ...(prev.posOrdersGroupSummary?.amounts || []),
              ...(fetchMoreResult.posOrdersGroupSummary?.amounts || []),
            ],
            columns:
              fetchMoreResult.posOrdersGroupSummary?.columns ||
              prev.posOrdersGroupSummary?.columns,
          },
        };
      },
    });
  };

  return {
    loading,
    posSummaryList: transformedPosList,
    totalCount: data?.posOrdersGroupSummary?.amounts?.length || 0,
    handleFetchMore,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
  };
};
