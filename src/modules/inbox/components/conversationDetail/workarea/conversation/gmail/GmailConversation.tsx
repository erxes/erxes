import { IConversation, IMessage } from 'modules/inbox/types';
import * as React from 'react';
import { SimpleMessage } from '../messages';
import { Mail } from './';
import { InternalMessages } from './style';

type Props = {
  conversation: IConversation;
  conversationMessages: IMessage[];
};

class GmailConversation extends React.Component<Props, {}> {
  renderInternals(messages: IMessage[]) {
    return messages
      .filter(message => message.internal)
      .map(message => {
        return (
          <SimpleMessage
            message={message}
            isStaff={!message.customerId}
            key={message._id}
          />
        );
      });
  }

  render() {
    const { conversation, conversationMessages } = this.props;

    if (!conversation) {
      return null;
    }

    const messages = conversationMessages || [];

    return (
      <>
        {messages.map(message => {
          return <Mail key={message._id} message={message} />;
        })}
        <InternalMessages>{this.renderInternals(messages)}</InternalMessages>
      </>
    );
  }
}

export default GmailConversation;
