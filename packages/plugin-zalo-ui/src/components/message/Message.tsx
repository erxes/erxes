import React from 'react';
import Attachment from './Attachment';
import SimpleMessage from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/messages/SimpleMessage';

class Message extends SimpleMessage {
  constructor(props) {
    super(props);
  }

  renderAttachment(hasAttachment: boolean) {
    const { message } = this.props;
    const { attachments } = message;

    if (!hasAttachment) {
      return null;
    }

    return attachments.map((attachment) => {
      return <Attachment key={attachment.id} attachment={attachment} simple={true} />;
    });
  }
}

export default Message;
