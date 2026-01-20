import { useQueryState } from "erxes-ui";
import { IInstagramConversationMessage } from "../types/InstagramTypes";
import { GET_CONVERSATION_MESSAGES } from "../graphql/queries/igConversationQueries";
import { useQuery } from "@apollo/client";
import { CONVERSATION_MESSAGE_INSERTED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { newMessagesCountState } from "@/inbox/conversations/states/newMessagesCountState";
import { useEffect } from "react";


export interface IInstagramConversationMessagesQuery {
    instagramConversationMessages : IInstagramConversationMessage[];
}

export interface IInstagramConversationMessagesQueryVariables {
    _id? : string;
    conversationId?: string;
    limit?: number;
    skip?: number;
    getFirst?: boolean;
}

export const INSTAGRAM_CONVERSATION_MESSAGES_LIMIT = 20;

export const useInstagramConversationMessages = () => {
    const [conversationId] = useQueryState<string>('conversationId');

    const { data, loading, error, fetchMore, subscribeToMore, client } = useQuery<
    IInstagramConversationMessagesQuery,
    IInstagramConversationMessagesQueryVariables
  >(GET_CONVERSATION_MESSAGES, {
    variables: {
      conversationId: conversationId || '',
      limit: INSTAGRAM_CONVERSATION_MESSAGES_LIMIT,
    },
    skip: !conversationId,
    fetchPolicy: 'cache-and-network',
  });

  const {instagramConversationMessages} = data || {};

  const handleFetchMore = () => {
    if (
        instagramConversationMessages?.length && 
        instagramConversationMessages?.length %
          INSTAGRAM_CONVERSATION_MESSAGES_LIMIT === 
          0
    ){
      fetchMore({
        variables: {
          skip: data?.instagramConversationMessages?.length || 0,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if(!fetchMoreResult){
            return prev;
          }
          return {
            instagramConversationMessages : [
              ...fetchMoreResult.instagramConversationMessages,
              ...prev.instagramConversationMessages,
            ],
          };
        },
      });
    }
  };

  useEffect(()=>{
    if(!conversationId) return;
    const unsubscribe = subscribeToMore<{
      conversationMessageInserted : IInstagramConversationMessage;
    }>({
      document:CONVERSATION_MESSAGE_INSERTED,
      variables:{
        _id: conversationId || '',
      },
      updateQuery: (prev, {subscriptionData}) => {
        if(!prev || !subscriptionData.data) return prev;

        const newMessage = subscriptionData.data.conversationMessageInserted;

        const messageExists = prev.instagramConversationMessages.some(
          (msg: IInstagramConversationMessage) => msg._id === newMessage._id,
        );

        if(messageExists) return prev;

        try{
          const conversationCacheId = client.cache.identify({
            __typename:'Conversation',
            _id:conversationId,
          });

          if(conversationCacheId && !newMessage.internal){
            client.cache.modify({
              id: conversationCacheId,
              fields: {
                content: () => newMessage.content,
                updatedAt:() => newMessage.createdAt,
              },
            });
          }
        } catch (error){
          console.error('Error updating cache:', error);
        }

        return{
          ...prev,
          instagramConversationMessages:[
            ...prev.instagramConversationMessages,
            {
              ...newMessage,
              conversationId,
              __typename: 'InstagramConversationMessage',
            },
          ],
        };
      },
    });
    return unsubscribe;
  }, [conversationId]); 

  return {
    instagramConversationMessages,
    handleFetchMore,
    loading, 
    error,
  };
};