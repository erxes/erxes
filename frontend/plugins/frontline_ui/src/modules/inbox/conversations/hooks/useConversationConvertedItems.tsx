import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_CONVERTED_ITEMS } from '@/inbox/conversations/graphql/queries/getConversationConvertedItems';
import { compactList } from '@/shared/utils/cursorList';

export const useConversationConvertedItems = (conversationId?: string) => {
  const { data, loading } = useQuery(GET_CONVERSATION_CONVERTED_ITEMS, {
    variables: conversationId ? { _id: conversationId } : undefined,
    skip: !conversationId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    convertedItems: compactList(data?.conversationConvertedItems),
    loading,
  };
};
