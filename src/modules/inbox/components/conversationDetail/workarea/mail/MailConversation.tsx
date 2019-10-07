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
          message={message}
          kind={kind}
          integrationId={_id}
        />
      );
    });
  }
}

export default MailConversation;
