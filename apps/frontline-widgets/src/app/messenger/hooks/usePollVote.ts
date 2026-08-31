import { useMutation, useQuery } from '@apollo/client';
import { getLocalStorageItem } from '@libs/utils';
import { useAtomValue } from 'jotai';
import { WIDGETS_POLL_VOTE_MUTATION } from '../graphql/mutations';
import { GET_WIDGETS_POLL_VOTES } from '../graphql/queries';
import { connectionAtom, conversationIdAtom } from '../states';

type TPollVoteSelection = {
  messageId: string;
  optionIds: string[];
};

export const usePollVote = () => {
  const conversationId = useAtomValue(conversationIdAtom);
  const connection = useAtomValue(connectionAtom);

  const { visitorId, customerId: connectedCustomerId } =
    connection.widgetsMessengerConnect || {};

  const customerId = connectedCustomerId || getLocalStorageItem('customerId');

  const { data, loading } = useQuery(GET_WIDGETS_POLL_VOTES, {
    variables: {
      conversationId,
      customerId: customerId || undefined,
      visitorId: visitorId || undefined,
    },
    skip: !conversationId || (!customerId && !visitorId),
    fetchPolicy: 'cache-and-network',
  });

  const [votePoll, { loading: voting }] = useMutation(
    WIDGETS_POLL_VOTE_MUTATION,
    {
      refetchQueries: ['widgetsPollVotes'],
    },
  );

  const selections = (data?.widgetsPollVotes ||
    []) as TPollVoteSelection[];

  const selectedOptionIds = (messageId: string) =>
    selections.find((selection) => selection.messageId === messageId)
      ?.optionIds || [];

  const vote = (messageId: string, optionIds: string[]) =>
    votePoll({
      variables: {
        messageId,
        optionIds,
        customerId: customerId || undefined,
        visitorId: visitorId || undefined,
      },
    });

  return {
    vote,
    voting,
    loading,
    selectedOptionIds,
    canVote: Boolean(customerId || visitorId),
  };
};
