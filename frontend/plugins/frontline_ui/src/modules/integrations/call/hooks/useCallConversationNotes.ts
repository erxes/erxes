import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { CONVERSATION_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { getCallConversationNotes } from '@/integrations/call/graphql/queries/callConversationNoteQueries';
import { ICallConversationNote } from '@/integrations/call/types/callTypes';

export interface ICallConversationNotesQuery {
  callConversationNotes: ICallConversationNote[];
}
export interface ICallConversationNotesQueryVariables {
  _id?: string;
  conversationId?: string;
  limit?: number;
  skip?: number;
  getFirst?: boolean;
}

export const CALL_CONVERSATION_NOTES_LIMIT = 20;

export const useCallConversationNotes = () => {
  const [conversationId] = useQueryState<string>('conversationId');

  const { data, loading, error, fetchMore, subscribeToMore, client } = useQuery<
    ICallConversationNotesQuery,
    ICallConversationNotesQueryVariables
  >(getCallConversationNotes, {
    variables: {
      conversationId: conversationId || '',
      limit: CALL_CONVERSATION_NOTES_LIMIT,
    },
    skip: !conversationId,
    fetchPolicy: 'cache-and-network',
  });

  const { callConversationNotes } = data || {};

  const handleFetchMore = () => {
    if (
      callConversationNotes?.length &&
      callConversationNotes?.length % CALL_CONVERSATION_NOTES_LIMIT === 0
    ) {
      fetchMore({
        variables: {
          skip: data?.callConversationNotes?.length || 0,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return prev;
          }
          return {
            callConversationNotes: [
              ...fetchMoreResult.callConversationNotes,
              ...prev.callConversationNotes,
            ],
          };
        },
      });
    }
  };

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMore<{
      conversationMessageInserted: ICallConversationNote;
    }>({
      document: CONVERSATION_MESSAGE_INSERTED,
      variables: {
        _id: conversationId || '',
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const newMessage = subscriptionData.data.conversationMessageInserted;

        // Check if the message already exists to prevent duplicates
        const messageExists = prev.callConversationNotes.some(
          (msg: ICallConversationNote) => msg._id === newMessage._id,
        );

        if (messageExists) return prev;

        try {
          // Get the cache ID for the conversation
          const conversationCacheId = client.cache.identify({
            __typename: 'Conversation',
            _id: conversationId,
          });

          if (conversationCacheId && !newMessage.internal) {
            // Update the conversation in the cache
            client.cache.modify({
              id: conversationCacheId,
              fields: {
                content: () => newMessage.content,
                updatedAt: () => newMessage.createdAt,
              },
            });
          }
        } catch (error) {
          console.error('Error updating cache:', error);
        }

        return {
          ...prev,
          callConversationNotes: [
            ...prev.callConversationNotes,
            {
              ...newMessage,
              conversationId,
              __typename: 'CallConversationNote',
            },
          ],
        };
      },
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  return {
    callConversationNotes,
    handleFetchMore,
    loading,
    error,
  };
};
