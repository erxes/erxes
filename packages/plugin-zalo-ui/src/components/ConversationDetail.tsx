import React, { useState, useEffect } from 'react';
import { gql } from '@apollo/client';
import strip from 'strip';
import { queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { sendDesktopNotification } from '@erxes/ui/src/utils';

import { subscriptions } from '@erxes/ui-inbox/src/inbox/graphql';

import Message from './message/Message';
import { useQuery } from '@apollo/client';

type Props = {
  currentId: string;
};

const Detail = (props: Props) => {
  let prevMessageInsertedSubscription = null as any;
  let prevTypingInfoSubscription;
  const { currentId } = props;

  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingInfo, setTypingInfo] = useState('');

  const messagesQuery = useQuery(gql(queries.zaloConversationMessages), {
    variables: {
      conversationId: currentId,
      limit: 0,
      skip: 0,
    },
    fetchPolicy: 'network-only',
  });

  const messagesTotalCountQuery = useQuery(
    gql(queries.zaloConversationMessagesCount),
    {
      variables: { conversationId: currentId },
      fetchPolicy: 'network-only',
    },
  );

  useEffect(() => {
    // It is first time or subsequent conversation change
    if (!prevMessageInsertedSubscription || currentId !== props.currentId) {
      // Unsubscribe previous subscription ==========
      if (prevMessageInsertedSubscription) {
        prevMessageInsertedSubscription();
      }

      if (prevTypingInfoSubscription) {
        setTypingInfo('');
        prevTypingInfoSubscription();
      }

      // Start new subscriptions =============
      prevMessageInsertedSubscription = messagesQuery.subscribeToMore({
        document: gql(subscriptions.conversationMessageInserted),
        variables: { _id: currentId },
        updateQuery: (prev, { subscriptionData }) => {
          const message = subscriptionData.data.conversationMessageInserted;

          if (!prev) {
            return;
          }

          if (currentId !== props.currentId) {
            return;
          }

          const messages = prev.zaloConversationMessages;

          // Sometimes it is becoming undefined because of left sidebar query
          if (!messages) {
            return;
          }

          // check whether or not already inserted
          const prevEntry = messages.find((m) => m._id === message._id);

          if (prevEntry) {
            return;
          }

          // add new message to messages list
          const next = {
            ...prev,
            zaloConversationMessages: [...messages, message],
          };

          // send desktop notification
          sendDesktopNotification({
            title: 'You have a message from Zalo',
            content: strip(message.content) || '',
          });

          return next;
        },
      });

      prevTypingInfoSubscription = messagesQuery.subscribeToMore({
        document: gql(subscriptions.conversationClientTypingStatusChanged),
        variables: { _id: currentId },
        updateQuery: (
          _prev,
          {
            subscriptionData: {
              data: { conversationClientTypingStatusChanged },
            },
          },
        ) => {
          setTypingInfo(conversationClientTypingStatusChanged.text);
        },
      });
    }
  }, [currentId, messagesQuery]);

  const loadMoreMessages = () => {
    const { zaloConversationMessagesCount } = messagesTotalCountQuery.data;
    const conversationMessages =
      messagesQuery.data.zaloConversationMessages || [];

    const loading = messagesQuery.loading || messagesTotalCountQuery.loading;
    const hasMore = zaloConversationMessagesCount > conversationMessages.length;

    if (!loading && hasMore) {
      setLoadingMessages(true);

      messagesQuery.fetchMore({
        variables: {
          conversationId: currentId,
          limit: 10,
          skip: conversationMessages.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          setLoadingMessages(false);

          if (!fetchMoreResult) {
            return prev;
          }

          const prevConversationMessages = prev.zaloConversationMessages || [];
          const prevMessageIds = prevConversationMessages.map((m) => m._id);

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
              ...prevConversationMessages,
            ],
          };
        },
      });
    }
  };

  const renderMessages = (messages: any[], conversationFirstMessage: any) => {
    const rows: React.ReactNode[] = [];

    let tempId;

    console.log('messages:', messages);

    // return rows

    messages.forEach((message) => {
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
            name,
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
        />,
      );

      tempId = message.userId ? message.userId : message.customerId;
    });

    console.log('rows:', rows.length);

    return rows;
  };

  if (messagesQuery.loading) {
    return <Spinner />;
  }

  const messages = messagesQuery.data.zaloConversationMessages || [];
  console.log('messagesQuery.zaloConversationMessages:', messages.length);
  return renderMessages(
    messagesQuery.data.zaloConversationMessages,
    messages[0],
  );
};

export default Detail;
