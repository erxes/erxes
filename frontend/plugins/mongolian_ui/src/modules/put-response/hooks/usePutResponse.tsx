import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { PUT_RESPONSE_CURSOR_SESSION_KEY } from '@/put-response/constants/putResponseCursorSessionKey';
import { putResponseQueries } from '@/put-response/graphql/PutResopnseQueries';
import { IPutResponse } from '@/put-response/types/PutResponseType';
export const PUT_RESPONSE_PER_PAGE = 30;

export const usePutResponse = (options?: QueryHookOptions) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: PUT_RESPONSE_CURSOR_SESSION_KEY,
  });
  const { data, loading, fetchMore } = useQuery<{
    putResponses: {
      list: IPutResponse[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(putResponseQueries.putResponses, {
    ...options,
    variables: {
      limit: PUT_RESPONSE_PER_PAGE,
      cursor,
      ...options?.variables,
    },
  });

  const { list: putResponses, totalCount, pageInfo } = data?.putResponses || {};

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
        limit: PUT_RESPONSE_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          putResponses: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.putResponses,
              prevResult: prev.putResponses,
            }),
            totalCount: prev.putResponses.totalCount,
          },
        };
      },
    });
  };

  return {
    loading,
    putResponses,
    totalCount,
    handleFetchMore,
    pageInfo,
  };
};
