import { NetworkStatus, QueryHookOptions, useQuery } from '@apollo/client';
import { GET_RESPONSES } from '@/responseTemplate/graphql/queries/getResponses';
import { EnumCursorDirection, validateFetchMore } from 'erxes-ui';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/shared/utils/cursorList';
import type {
  ResponseTemplatesQuery,
  ResponseTemplatesQueryVariables,
} from '~/gql/graphql';

export const RESPONSES_PER_PAGE = 24;

export const useGetResponses = (
  options?: QueryHookOptions<
    ResponseTemplatesQuery,
    ResponseTemplatesQueryVariables
  >,
) => {
  const baseFilter = {
    limit: RESPONSES_PER_PAGE,
    orderBy: { createdAt: -1 },
    ...options?.variables?.filter,
  };

  const { data, fetchMore, networkStatus, refetch } = useQuery(GET_RESPONSES, {
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    ...options,
    variables: {
      filter: baseFilter,
    },
  });

  const responses = data?.responseTemplates?.list
    ? compactList(data.responseTemplates.list)
    : undefined;
  const totalCount = data?.responseTemplates?.totalCount ?? undefined;
  const pageInfo = toCursorPageInfo(data?.responseTemplates?.pageInfo);

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
        if (!fetchMoreResult.responseTemplates || !prev.responseTemplates) {
          return prev;
        }
        return {
          ...prev,
          responseTemplates: mergeCursorList(
            direction,
            prev.responseTemplates,
            fetchMoreResult.responseTemplates,
          ),
        };
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

