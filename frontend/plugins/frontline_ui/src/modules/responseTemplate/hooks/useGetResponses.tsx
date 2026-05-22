import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_RESPONSES } from '@/responseTemplate/graphql/queries/getResponses';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { IResponseTemplate } from '../types';

const RESPONSES_PER_PAGE = 24;

export const useGetResponses = (options?: QueryHookOptions) => {
  const { data, loading, fetchMore } = useQuery<
    ICursorListResponse<IResponseTemplate>
  >(GET_RESPONSES, {
    variables: {
      filter: {
        limit: RESPONSES_PER_PAGE,
        orderBy: { createdAt: -1 },
        ...options?.variables?.filter,
      },
    },
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  const {
    list: responses,
    totalCount,
    pageInfo,
  } = data?.responseTemplates || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) return;
    fetchMore({
      variables: {
        filter: {
          cursor: pageInfo?.endCursor,
          limit: RESPONSES_PER_PAGE,
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
    loading,
    handleFetchMore,
    totalCount,
    pageInfo,
  };
};
