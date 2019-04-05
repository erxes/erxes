import { IConversation, IMessage } from 'modules/inbox/types';
import * as React from 'react';
import { SimpleMessage } from '../messages';
import { Mail } from './';
import { EmailItem } from './style';

type Props = {
  conversation: IConversation;
  conversationMessages: IMessage[];
};

class GmailConversation extends React.Component<Props, {}> {
  render() {
    const { conversation, conversationMessages } = this.props;

    if (!conversation) {
      return null;
    }

    const messages = conversationMessages || [];

    return messages.map(message => {
      if (message.internal) {
        return (
          <EmailItem>
            <SimpleMessage
              message={message}
              isStaff={!message.customerId}
              key={message._id}
            />
          </EmailItem>
        );
      }

      return (
        <Mail
          key={message._id}
          message={message}
          integrationId={conversation.integration._id}
        />
      );
    });
  }
}

export default GmailConversation;
