import { NetworkStatus, QueryHookOptions, useQuery } from '@apollo/client';
import { GET_RESPONSES } from '@/responseTemplate/graphql/queries/getResponses';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { IResponseTemplate } from '../types';

export const RESPONSES_PER_PAGE = 24;

export const useGetResponses = (options?: QueryHookOptions) => {
  const baseFilter = {
    limit: RESPONSES_PER_PAGE,
    orderBy: { createdAt: -1 },
    ...options?.variables?.filter,
  };

  const { data, fetchMore, networkStatus, refetch } = useQuery<
    ICursorListResponse<IResponseTemplate>
  >(GET_RESPONSES, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    ...options,
    variables: {
      filter: baseFilter,
    },
  });

  const {
    list: responses,
    totalCount,
    pageInfo,
  } = data?.responseTemplates || {};

  const isInitialLoad = networkStatus === NetworkStatus.loading;
  const isRefetching =
    networkStatus === NetworkStatus.setVariables ||
    networkStatus === NetworkStatus.refetch;

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;
    fetchMore({
      variables: {
        filter: {
          ...baseFilter,
          cursor: pageInfo?.endCursor,
          direction,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          responseTemplates: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.responseTemplates,
            prevResult: prev.responseTemplates,
          }),
        });
      },
    });
  };

  return {
    responses,
    isInitialLoad,
    isRefetching,
    handleFetchMore,
    totalCount,
    pageInfo,
    refetch,
  };
};

