import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_CONVERTED_ITEMS } from '@/inbox/conversations/graphql/queries/getConversationConvertedItems';
import { IConversationConvertedItem } from '@/inbox/conversations/types/conversationConvert';

export const useConversationConvertedItems = (conversationId?: string) => {
  const { data, loading } = useQuery<{
    conversationConvertedItems: IConversationConvertedItem[] | null;
  }>(GET_CONVERSATION_CONVERTED_ITEMS, {
    variables: { _id: conversationId },
    skip: !conversationId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    convertedItems: data?.conversationConvertedItems || [],
    loading,
  };
};
