import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  useMultiQueryState,
  validateFetchMore,
} from 'erxes-ui';
import { BROADCAST_MESSAGES } from '../graphql/queries';

export const useBroadcastMessageVariables = () => {
  const [{ searchValue, brand, fromUser, trigger, status, methods }] =
    useMultiQueryState<{
      searchValue: string;
      brand: string;
      fromUser: string;
      trigger: string;
      status: string;
      methods: string;
    }>([
      'searchValue',
      'brand',
      'fromUser',
      'trigger',
      'status',
      'methods',
    ]);

  // `kind` is deliberately absent. What starts a campaign is read from its
  // schedule and filtered as `trigger`; a leftover `kind` in a link used to go
  // on narrowing the list with nothing on screen to say so or undo it.
  return {
    searchValue: searchValue || undefined,
    brandId: brand || undefined,
    fromUserId: fromUser || undefined,
    trigger: trigger || undefined,
    status: status || undefined,
    method: methods || undefined,
  };
};

export const useMessages = () => {
  const variables = useBroadcastMessageVariables();

  const { data, loading, error, refetch, fetchMore } = useQuery(
    BROADCAST_MESSAGES,
    {
      variables,
    },
  );

  const {
    list: messages,
    pageInfo,
    totalCount = 0,
  } = data?.engageMessages || {};

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
    totalCount,
    loading,
    error,
    refetch,
    handleFetchMore,
  };
};
