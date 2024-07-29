import gql from 'graphql-tag';
import * as React from 'react';
import { useEffect } from 'react';
import client from '../../apollo-client';
import { getLocalStorageItem } from '../../common';
import { IParticipator, IUser } from '../../types';
import ConversationDetail from '../components/ConversationDetail';
import { connection } from '../connection';
import graphqlTypes from '../graphql';
import { IMessage } from '../types';
import { useQuery } from '@apollo/react-hooks';
import { useConversation } from '../context/Conversation';
import { getMessengerData } from '../utils/util';
import { useMessage } from '../context/Message';

type PropsWithConsumer = {
  supporters: IUser[];
  loading?: boolean;
};

const ConversationDetailContainer: React.FC<PropsWithConsumer> = (props) => {
  const {
    isBotTyping,
    setIsBotTyping,
    activeConversationId: conversationId,
    goToConversationList,
    endConversation,
  } = useConversation();

  const { errorMessage } = useMessage();

  const { data, loading, subscribeToMore } = useQuery(
    gql(
      graphqlTypes.conversationDetailQuery(connection.enabledServices.dailyco)
    ),
    {
      variables: {
        _id: conversationId,
        integrationId: connection.data.integrationId,
      },
      fetchPolicy: 'network-only',
    }
  );

  const { isOnline, forceLogoutWhenResolve } = getMessengerData();

  useEffect(() => {
    if (!data || !conversationId || loading) {
      return;
    }

    // listen for bot message typing
    const botTypingSubscription = client
      .subscribe({
        query: gql(graphqlTypes.conversationBotTypingStatus),
        variables: { _id: conversationId },
        fetchPolicy: 'network-only',
      })
      .subscribe({
        next({ data: { conversationBotTypingStatus } }) {
          const { typing } = conversationBotTypingStatus;
          setIsBotTyping(typing);
        },
      });

    // lister for new message
    const messageSubscription = subscribeToMore({
      document: gql(
        graphqlTypes.conversationMessageInserted(
          connection.enabledServices.dailyco
        )
      ),
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const message = subscriptionData.data.conversationMessageInserted;
        const widgetsConversationDetail = prev.widgetsConversationDetail || {};
        const messages = widgetsConversationDetail.messages || [];

        // check whether or not already inserted
        const prevEntry = messages.find((m: IMessage) => m._id === message._id);

        if (prevEntry) {
          return prev;
        }

        // do not show internal or bot messages
        if (message.internal || message.fromBot) {
          return prev;
        }

        // add new message to messages list
        const next = {
          ...prev,
          widgetsConversationDetail: {
            ...widgetsConversationDetail,
            messages: [...messages, message],
          },
        };

        return next;
      },
    });

    // lister for conversation status change
    const statusSubscription = subscribeToMore({
      document: gql(graphqlTypes.conversationChanged),
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const subData = subscriptionData.data || {};
        const conversationChanged = subData.conversationChanged || {};
        const type = conversationChanged.type;

        if (forceLogoutWhenResolve && type === 'closed') {
          endConversation();
        }
      },
    });

    return () => {
      botTypingSubscription.unsubscribe();
      messageSubscription();
      statusSubscription();
    };
  }, [
    conversationId,
    data,
    endConversation,
    forceLogoutWhenResolve,
    isBotTyping,
    subscribeToMore,
    loading,
  ]);

  let messages: IMessage[] = [];
  let participators: IParticipator[] = [];
  let state: boolean = isOnline || false;
  let operatorStatus;
  let refetchConversationDetail;

  if (data && data.widgetsConversationDetail) {
    const conversationDetail = data.widgetsConversationDetail;
    messages = conversationDetail.messages;
    participators = conversationDetail.participatedUsers || [];
    state = conversationDetail.isOnline;
    operatorStatus = conversationDetail.operatorStatus;
    refetchConversationDetail = data.refetch;
  }

  const { messengerData }: any = JSON.parse(
    getLocalStorageItem('messengerDataJson')
  );

  if (!messengerData.showLauncher && connection.enabledServices.engages) {
    client.query({
      query: gql(graphqlTypes.getEngageMessage),
      variables: {
        integrationId: connection.data.integrationId,
        customerId: connection.data.customerId,
        visitorId: connection.data.visitorId,
        browserInfo: {},
      },
    });
  }

  return (
    <ConversationDetail
      goToConversationList={goToConversationList}
      supporters={props.supporters}
      errorMessage={errorMessage}
      operatorStatus={operatorStatus}
      messages={messages}
      isOnline={state}
      participators={participators}
      refetchConversationDetail={refetchConversationDetail}
      isLoading={loading}
    />
  );
};

export default ConversationDetailContainer;
