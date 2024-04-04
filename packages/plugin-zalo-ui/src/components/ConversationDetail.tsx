import React from 'react';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import strip from 'strip';
import { graphql } from '@apollo/client/react/hoc';
import MailConversation from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/mail/MailConversation';
import SimpleMessage from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/messages/SimpleMessage';
import { queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps, sendDesktopNotification } from '@erxes/ui/src/utils';

import { IUser } from '@erxes/ui/src/auth/types';
import { subscriptions } from '@erxes/ui-inbox/src/inbox/graphql';

import Message from './message/Message';

type Props = {
  currentId: string;
};

class Detail extends React.Component<any> {
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

          const messages = prev.zaloConversationMessages;

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
            zaloConversationMessages: [...messages, message]
          };

          // send desktop notification
          sendDesktopNotification({
            title: 'You have a message from Zalo',
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
    const { zaloConversationMessagesCount } = messagesTotalCountQuery;
    const conversationMessages = messagesQuery.zaloConversationMessages || [];

    const loading = messagesQuery.loading || messagesTotalCountQuery.loading;
    const hasMore = zaloConversationMessagesCount > conversationMessages.length;

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

          const prevConversationMessages = prev.zaloConversationMessages || [];
          const prevMessageIds = prevConversationMessages.map(m => m._id);

          const fetchedMessages: any[] = [];

          for (const message of fetchMoreResult.zaloConversationMessages) {
            if (!prevMessageIds.includes(message._id)) {
              fetchedMessages.push(message);
            }
          }

          return {
            ...prev,
            zaloConversationMessages: [
              ...fetchedMessages,
              ...prevConversationMessages
            ]
          };
        }
      });
    }
  };

  renderMessages(messages: any[], conversationFirstMessage: any) {
    const rows: React.ReactNode[] = [];

    let tempId;

    console.log('messages:', messages);

    // return rows

    messages.forEach(message => {
      let parsedMessage = message;
      parsedMessage.attachments = message.attachments
        ?.map((attachment: any) => {
          let type = attachment?.type || 'text';
          const url = attachment?.url;
          const name = attachment?.name;

          if (['voice'].includes(type)) {
            type = 'audio';
          }
          if (['sticker', 'gif'].includes(type)) {
            type = 'image';
          }

          let output: any = {
            type,
            name
          };

          console.log(type, url, attachment);

          if (url) {
            output.url = url;
          }
          return output;
        })
        .filter((attachment: any) => !['text'].includes(attachment.type));

      rows.push(
        <Message
          isSameUser={
            message.userId
              ? message.userId === tempId
              : message.customerId === tempId
          }
          message={parsedMessage}
          key={message._id}
          isStaff={message.userId}
        />
      );

      tempId = message.userId ? message.userId : message.customerId;
    });

    console.log('rows:', rows.length);

    return rows;
  }

  render() {
    const {
      currentConversation,
      messagesQuery,
      zaloConversationMessages
    } = this.props;

    if (messagesQuery.loading) {
      return <Spinner />;
    }

    const messages = messagesQuery.zaloConversationMessages || [];
    console.log('messagesQuery.zaloConversationMessages:', messages.length);
    return this.renderMessages(
      messagesQuery.zaloConversationMessages,
      messages[0]
    );
  }
}

const WithQuery = withProps<Props & { currentUser: IUser }>(
  compose(
    // graphql<any>(gql(queries.zaloConversationMessages), {
    //   name: 'messagesQuery',
    //   options: ({ currentId }) => {
    //     return {
    //       variables: {
    //         conversationId: currentId
    //       },
    //       fetchPolicy: 'network-only'
    //     };
    //   }
    // }),
    graphql<any>(gql(queries.zaloConversationMessages), {
      // name: 'zaloConversationMessages',
      name: 'messagesQuery',
      options: ({ currentId }) => {
        return {
          variables: {
            conversationId: currentId,
            limit: 0,
            skip: 0
          },
          fetchPolicy: 'network-only'
        };
      }
    }),
    graphql<any>(gql(queries.zaloConversationMessagesCount), {
      name: 'messagesTotalCountQuery',
      options: ({ currentId }) => ({
        variables: { conversationId: currentId },
        fetchPolicy: 'network-only'
      })
    })
  )(Detail)
);

export default WithQuery;
