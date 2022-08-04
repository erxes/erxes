import gql from 'graphql-tag';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import client from '../../apollo-client';
import { IParticipator, IUser } from '../../types';
import { ConversationDetail as DumbComponent } from '../components';
import { connection } from '../connection';
import graphqlTypes from '../graphql';
import { IConversation, IMessage } from '../types';
import { AppConsumer } from './AppContext';

type Props = {
  conversationId: string;
  color?: string;
  goToConversationList: () => void;
  setBotTyping: (typing: boolean) => void;
  endConversation: (conversationId: string) => void;
  supporters: IUser[];
  loading?: boolean;
  isOnline?: boolean;
  forceLogoutWhenResolve?: boolean;
  errorMessage: string;
};

type QueryResponse = {
  widgetsConversationDetail: IConversation;
};

class ConversationDetail extends React.Component<
  ChildProps<Props, QueryResponse>,
  {}
> {
  componentWillMount() {
    const {
      data,
      endConversation,
      setBotTyping,
      conversationId,
      forceLogoutWhenResolve
    } = this.props;

    if (!data || !conversationId) {
      return;
    }

    // listen for bot message typing
    client
      .subscribe({
        query: gql(graphqlTypes.conversationBotTypingStatus),
        variables: { _id: conversationId },
        fetchPolicy: 'network-only'
      })
      .subscribe({
        next({ data: { conversationBotTypingStatus } }) {
          const { typing } = conversationBotTypingStatus;

          return setBotTyping(typing);
        }
      });

    // lister for new message
    data.subscribeToMore({
      document: gql(graphqlTypes.conversationMessageInserted),
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
            messages: [...messages, message]
          }
        };

        return next;
      }
    });

    // lister for conversation status change
    data.subscribeToMore({
      document: gql(graphqlTypes.conversationChanged),
      variables: { _id: conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        const subData = subscriptionData.data || {};
        const conversationChanged = subData.conversationChanged || {};
        const type = conversationChanged.type;

        if (forceLogoutWhenResolve && type === 'closed') {
          endConversation(conversationId);
        }
      }
    });
  }

  render() {
    const { data, isOnline } = this.props;

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

    return (
      <DumbComponent
        {...this.props}
        operatorStatus={operatorStatus}
        messages={messages}
        isOnline={state}
        participators={participators}
        refetchConversationDetail={refetchConversationDetail}
      />
    );
  }
}

const query = compose(
  graphql<{ conversationId: string }>(
    gql(graphqlTypes.conversationDetailQuery),
    {
      options: ownProps => ({
        variables: {
          _id: ownProps.conversationId,
          integrationId: connection.data.integrationId
        },
        fetchPolicy: 'network-only'
      })
    }
  )
);

const WithQuery = query(ConversationDetail);

type PropsWithConsumer = {
  supporters: IUser[];
  loading?: boolean;
};

const WithConsumer = (props: PropsWithConsumer) => {
  return (
    <AppConsumer>
      {({
        activeConversation,
        goToConversationList,
        endConversation,
        getColor,
        setBotTyping,
        getMessengerData,
        getBotInitialMessage,
        errorMessage
      }) => {
        const key = activeConversation || 'create';
        const {
          isOnline,
          forceLogoutWhenResolve,
          botShowInitialMessage, 
          showTimezone
        } = getMessengerData();

        return (
          <WithQuery
            {...props}
            key={key}
            isOnline={isOnline}
            forceLogoutWhenResolve={forceLogoutWhenResolve}
            conversationId={activeConversation}
            goToConversationList={goToConversationList}
            getBotInitialMessage={getBotInitialMessage}
            botShowInitialMessage={botShowInitialMessage}
            showTimezone={showTimezone}
            setBotTyping={setBotTyping}
            endConversation={endConversation}
            errorMessage={errorMessage}
            color={getColor()}
          />
        );
      }}
    </AppConsumer>
  );
};

export default WithConsumer;
