import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import React from 'react';

import { withProps } from '@erxes/ui/src/utils';
import { queries } from '../graphql';
import { IConversationMessage, MessagesQueryResponse } from '../types';
import { Spinner } from '@erxes/ui/src/components';
import Message from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/messages/Message';

type Props = {
  currentId: string;
};

type FinalProps = {
  messagesQuery: MessagesQueryResponse;
} & Props;

class ConversationDetailContainer extends React.Component<FinalProps> {
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

export default withProps<Props>(
  compose(
    graphql<Props, MessagesQueryResponse>(
      gql(queries.facebookConversationMessages),
      {
        name: 'messagesQuery',
        options: ({ currentId }: Props) => ({
          variables: {
            conversationId: currentId,
            getFirst: true
          }
        })
      }
    )
  )(ConversationDetailContainer)
);
