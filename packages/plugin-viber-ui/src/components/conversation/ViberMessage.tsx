import React from 'react';
import SimpleMessage from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/messages/SimpleMessage';
import { IConversation, IMessage } from '@erxes/ui-inbox/src/inbox/types';
import { ViberChatPanel } from '../../styles';

type Props = {
  conversation: IConversation;
  conversationMessages: IMessage[];
};

class ViberMessage extends React.Component<Props, {}> {
  render() {
    const { conversation, conversationMessages } = this.props;

    if (!conversation) {
      return null;
    }

    const messages = conversationMessages || [];

    const Chat = messages.map(message => (
      <SimpleMessage
        key={message._id}
        message={message}
        isStaff={!message.customerId}
      />
    ));

    return <ViberChatPanel>{Chat}</ViberChatPanel>;
  }
}

export default ViberMessage;
