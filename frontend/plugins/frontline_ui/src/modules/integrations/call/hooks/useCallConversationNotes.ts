import { useQuery, useSubscription } from '@apollo/client';
import { isDefined, useQueryState } from 'erxes-ui';
import { getCallConversationNotes } from '@/integrations/call/graphql/queries/callConversationNoteQueries';
import { CALL_CONVERSATION_NOTE_INSERTED } from '@/integrations/call/graphql/subscriptions/subscriptions';

export const CALL_CONVERSATION_NOTES_LIMIT = 20;

export const useCallConversationNotes = () => {
  const [conversationId] = useQueryState<string>('conversationId');
  const notesVariables = conversationId
    ? { conversationId, limit: CALL_CONVERSATION_NOTES_LIMIT }
    : undefined;

  const { data, loading, error, fetchMore } = useQuery(
    getCallConversationNotes,
    {
      variables: notesVariables,
      skip: !conversationId,
      fetchPolicy: 'cache-and-network',
    },
  );

  const callConversationNotes = data?.callConversationNotes?.filter(isDefined);

  const handleFetchMore = () => {
    if (
      callConversationNotes?.length &&
      callConversationNotes.length % CALL_CONVERSATION_NOTES_LIMIT === 0
    ) {
      fetchMore({
        variables: {
          skip: callConversationNotes.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }
          return {
            callConversationNotes: [
              ...(fetchMoreResult.callConversationNotes ?? []),
              ...(prev.callConversationNotes ?? []),
            ],
          };
        },
      });
    }
  };

  useSubscription(CALL_CONVERSATION_NOTE_INSERTED, {
    variables: conversationId ? { conversationId } : undefined,
    skip: !conversationId,
    ignoreResults: true,
    onData: ({ client, data: subscriptionData }) => {
      const newMessage = subscriptionData.data?.conversationMessageInserted;

      if (!newMessage || !conversationId || !notesVariables) {
        return;
      }

      const note = {
        ...newMessage,
        conversationId,
        __typename: 'CallConversationNote',
      };
      let inserted = false;

      client.cache.updateQuery(
        { query: getCallConversationNotes, variables: notesVariables },
        (prev) => {
          const notes = prev?.callConversationNotes;

          if (!prev || !notes || notes.some((item) => item?._id === note._id)) {
            return undefined;
          }

          inserted = true;

          return { ...prev, callConversationNotes: [...notes, note] };
        },
      );

      if (!inserted || newMessage.internal) {
        return;
      }

      const conversationCacheId = client.cache.identify({
        __typename: 'Conversation',
        _id: conversationId,
      });

      if (conversationCacheId) {
        client.cache.modify({
          id: conversationCacheId,
          fields: {
            content: () => newMessage.content,
            updatedAt: () => newMessage.createdAt,
          },
        });
      }
    },
  });

  return {
    callConversationNotes,
    handleFetchMore,
    loading,
    error,
  };
};
