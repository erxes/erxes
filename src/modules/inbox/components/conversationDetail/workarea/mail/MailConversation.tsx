import { IConversation, IMessage } from 'modules/inbox/types';
import React from 'react';
import SimpleMessage from '../conversation/messages/SimpleMessage';
import Mail from './Mail';
import { EmailItem } from './style';

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

    return messages.map(message => {
      if (message.internal) {
        return (
          <EmailItem key={message._id}>
            <SimpleMessage message={message} isStaff={!message.customerId} />
          </EmailItem>
        );
      }

      return (
        <Mail
          key={message._id}
          kind={kind}
          message={message}
          integrationId={_id}
        />
      );
    });
  }
}

export default MailConversation;
