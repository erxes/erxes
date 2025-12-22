import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  validateFetchMore,
} from 'erxes-ui';
import { BROADCAST_MESSAGES } from '../graphql/queries';

export const useMessages = () => {
  const { data, loading, fetchMore } = useQuery(BROADCAST_MESSAGES);

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
