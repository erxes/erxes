import { useQuery, useSubscription } from '@apollo/client';
import { isDefined, useQueryState } from 'erxes-ui';
import { getCallConversationNotes } from '@/integrations/call/graphql/queries/callConversationNoteQueries';
import { CALL_CONVERSATION_NOTE_INSERTED } from '@/integrations/call/graphql/subscriptions/subscriptions';
import { useState } from 'react';

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
  // The conversation whose oldest note has been reached.
  const [exhaustedConversationId, setExhaustedConversationId] = useState<
    string | null
  >(null);
  const hasMore =
    !!conversationId &&
    exhaustedConversationId !== conversationId &&
    (callConversationNotes?.length ?? 0) >= CALL_CONVERSATION_NOTES_LIMIT;

  const handleFetchMore = () => {
    if (!hasMore || !conversationId || !callConversationNotes) return;
    return fetchMore({
      variables: {
        conversationId,
        limit: CALL_CONVERSATION_NOTES_LIMIT,
        skip: callConversationNotes.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        const older = fetchMoreResult?.callConversationNotes?.filter(isDefined);
        if (!older?.length) return prev;
        const known = new Set(
          prev.callConversationNotes?.map((note) => note?._id),
        );
        return {
          ...prev,
          callConversationNotes: [
            ...older.filter((note) => !known.has(note._id)),
            ...(prev.callConversationNotes ?? []),
          ],
        };
      },
    }).then(({ data: page }) => {
      if (
        (page?.callConversationNotes?.length ?? 0) <
        CALL_CONVERSATION_NOTES_LIMIT
      ) {
        setExhaustedConversationId(conversationId);
      }
    });
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
    conversationId,
    hasMore,
    handleFetchMore,
    loading,
    error,
  };
};
