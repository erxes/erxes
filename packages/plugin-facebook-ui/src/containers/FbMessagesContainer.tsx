import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import React from 'react';
import strip from 'strip';

import { sendDesktopNotification, withProps } from '@erxes/ui/src/utils';
import { Spinner } from '@erxes/ui/src/components';
import Message from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/messages/Message';

import { queries } from '../graphql';
import {
  IConversationMessage,
  MessagesQueryResponse,
  MessagesTotalCountQuery
} from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { subscriptions } from '@erxes/ui-inbox/src/inbox/graphql';

type Props = {
  currentId: string;
};

type FinalProps = {
  messagesQuery: MessagesQueryResponse;
  messagesTotalCountQuery: MessagesTotalCountQuery;
  currentUser: IUser;
} & Props;

type State = {
  loadingMessages: boolean;
  typingInfo?: string;
};

class ConversationDetailContainer extends React.Component<FinalProps, State> {
  private prevMessageInsertedSubscription;
  private prevTypingInfoSubscription;

  constructor(props) {
    super(props);

    this.state = { loadingMessages: false, typingInfo: '' };

    this.prevMessageInsertedSubscription = null;
  }

  componentWillReceiveProps(nextProps) {
    const { currentId, messagesQuery } = nextProps;

    // It is first time or subsequent conversation change
    if (
      !this.prevMessageInsertedSubscription ||
      currentId !== this.props.currentId
    ) {
      // Unsubscribe previous subscription ==========
      if (this.prevMessageInsertedSubscription) {
        this.prevMessageInsertedSubscription();
      }

      if (this.prevTypingInfoSubscription) {
        this.setState({ typingInfo: '' });
        this.prevTypingInfoSubscription();
      }

      // Start new subscriptions =============
      this.prevMessageInsertedSubscription = messagesQuery.subscribeToMore({
        document: gql(subscriptions.conversationMessageInserted),
        variables: { _id: currentId },
        updateQuery: (prev, { subscriptionData }) => {
          const message = subscriptionData.data.conversationMessageInserted;

          if (!prev) {
            return;
          }

          if (currentId !== this.props.currentId) {
            return;
          }

          const messages = prev.facebookConversationMessages;

          // Sometimes it is becoming undefined because of left sidebar query
          if (!messages) {
            return;
          }

          // check whether or not already inserted
          const prevEntry = messages.find(m => m._id === message._id);

          if (prevEntry) {
            return;
          }

          // add new message to messages list
          const next = {
            ...prev,
            facebookConversationMessages: [...messages, message]
          };

          // send desktop notification
          sendDesktopNotification({
            title: 'You have a message from facebook',
            content: strip(message.content) || ''
          });

          return next;
        }
      });

      this.prevTypingInfoSubscription = messagesQuery.subscribeToMore({
        document: gql(subscriptions.conversationClientTypingStatusChanged),
        variables: { _id: currentId },
        updateQuery: (
          _prev,
          {
            subscriptionData: {
              data: { conversationClientTypingStatusChanged }
            }
          }
        ) => {
          this.setState({
            typingInfo: conversationClientTypingStatusChanged.text
          });
        }
      });
    }
  }

  loadMoreMessages = () => {
    const { currentId, messagesTotalCountQuery, messagesQuery } = this.props;
    const { facebookConversationMessagesCount } = messagesTotalCountQuery;
    const conversationMessages =
      messagesQuery.facebookConversationMessages || [];

    const loading = messagesQuery.loading || messagesTotalCountQuery.loading;
    const hasMore =
      facebookConversationMessagesCount > conversationMessages.length;

    if (!loading && hasMore) {
      this.setState({ loadingMessages: true });

      messagesQuery.fetchMore({
        variables: {
          conversationId: currentId,
          limit: 10,
          skip: conversationMessages.length
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          this.setState({ loadingMessages: false });

          if (!fetchMoreResult) {
            return prev;
          }

          const prevConversationMessages =
            prev.facebookConversationMessages || [];
          const prevMessageIds = prevConversationMessages.map(m => m._id);

          const fetchedMessages: IConversationMessage[] = [];

          for (const message of fetchMoreResult.facebookConversationMessages) {
            if (!prevMessageIds.includes(message._id)) {
              fetchedMessages.push(message);
            }
          }

          return {
            ...prev,
            facebookConversationMessages: [
              ...fetchedMessages,
              ...prevConversationMessages
            ]
          };
        }
      });
    }
  };

  renderMessages(
    messages: IConversationMessage[],
    conversationFirstMessage: IConversationMessage
  ) {
    const rows: React.ReactNode[] = [];

    let tempId;

    messages.forEach(message => {
      rows.push(
        <Message
          isSameUser={
            message.userId
              ? message.userId === tempId
              : message.customerId === tempId
          }
          conversationFirstMessage={conversationFirstMessage}
          message={message}
          key={message._id}
        />
      );

      tempId = message.userId ? message.userId : message.customerId;
    });

    return rows;
  }

  render() {
    const { messagesQuery } = this.props;

    if (messagesQuery.loading) {
      return <Spinner />;
    }

    const messages = messagesQuery.facebookConversationMessages || [];

    return this.renderMessages(
      messagesQuery.facebookConversationMessages,
      messages[0]
    );
  }
}

export default withProps<Props & { currentUser: IUser }>(
  compose(
    graphql<
      Props,
      MessagesQueryResponse,
      { conversationId?: string; limit: number }
    >(gql(queries.facebookConversationMessages), {
      name: 'messagesQuery',
      options: ({ currentId }) => ({
        variables: {
          conversationId: currentId,
          limit: 0,
          skip: 0
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, MessagesTotalCountQuery, { conversationId?: string }>(
      gql(queries.facebookConversationMessagesCount),
      {
        name: 'messagesTotalCountQuery',
        options: ({ currentId }) => ({
          variables: { conversationId: currentId },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(ConversationDetailContainer)
);
