import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  useMultiQueryState,
  validateFetchMore,
} from 'erxes-ui';
import { BROADCAST_MESSAGES } from '../graphql/queries';

export const useBroadcastMessageVariables = () => {
  const [{ searchValue, brand, fromUser, kind, status, methods }] =
    useMultiQueryState<{
      searchValue: string;
      brand: string;
      fromUser: String;
      kind: string;
      status: string;
      methods: string;
    }>(['searchValue', 'brand', 'fromUser', 'kind', 'status', 'methods']);

  return {
    searchValue: searchValue || undefined,
    brandId: brand || undefined,
    fromUserId: fromUser || undefined,
    kind: kind || undefined,
    status: status || undefined,
    method: methods || undefined,
  };
};

export const useMessages = () => {
  const variables = useBroadcastMessageVariables();

  const { data, loading, fetchMore } = useQuery(BROADCAST_MESSAGES, {
    variables,
  });

  const { list: messages, pageInfo } = data?.engageMessages || {};

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: 20,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          engageMessages: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.engageMessages,
            prevResult: prev.engageMessages,
          }),
        });
      },
    });
  };

  return {
    messages,
    pageInfo,
    loading,
    handleFetchMore,
  };
};
