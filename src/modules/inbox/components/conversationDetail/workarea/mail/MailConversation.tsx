import { IConversation, IMessage } from 'modules/inbox/types';
import React from 'react';
import SimpleMessage from '../conversation/messages/SimpleMessage';
import Mail from './Mail';

type Props = {
  conversation: IConversation;
  conversationMessages: IMessage[];
};

class MailConversation extends React.Component<Props, {}> {
  render() {
    const { conversation, conversationMessages } = this.props;

    if (!conversation) {
      return null;
    }

    const messages = conversationMessages || [];
    const { integration } = conversation;
    const { _id, kind } = integration;

    const length = messages.length;

    return messages.map((message, index) => {
      if (message.internal) {
        return (
          <SimpleMessage
            key={message._id}
            message={message}
            isStaff={!message.customerId}
          />
        );
      }

      return (
        <Mail
          key={message._id}
          kind={kind}
          isLast={length === index + 1}
          message={message}
          integrationId={_id}
        />
      );
    });
  }
}

export default MailConversation;
