import { connectionAtom, integrationIdAtom } from '../states';
import { GET_WIDGETS_CONVERSATIONS } from '../graphql/queries';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { IConversationMessage } from '../types';

interface IQueryResponse {
  widgetsConversations: IConversationMessage[];
}

export const useConversations = (
  options?: QueryHookOptions<IQueryResponse>,
) => {
  const integrationId = useAtomValue(integrationIdAtom);
  const connection = useAtomValue(connectionAtom);
  const { customerId, visitorId } = connection.widgetsMessengerConnect || {};
  const { data, loading, error } = useQuery<IQueryResponse>(
    GET_WIDGETS_CONVERSATIONS,
    {
      ...options,
      variables: {
        integrationId,
        customerId: customerId || undefined,
        visitorId: visitorId || undefined,
      },
      fetchPolicy: 'network-only',
      skip: !integrationId,
    },
  );

  const lastMessagesByContent = useMemo(() => {
    return data?.widgetsConversations.map((conversation) => {
      return conversation.messages.find(
        (message) => message.content === conversation.content,
      );
    });
  }, [data]);

  return {
    conversations: data?.widgetsConversations || [],
    lastMesseges: lastMessagesByContent,
    loading,
    error,
  };
};
