import React from 'react';

import SimpleMessage from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/messages/SimpleMessage';
import { IConversationMessage } from '../../../types';

type Props = {
  message: IConversationMessage;
  isSameUser: boolean;
  conversationFirstMessage?: IConversationMessage;
};

function Message(props: Props) {
  const { message, isSameUser } = props;

  return (
    <SimpleMessage
      message={message}
      isStaff={message.userId ? true : false}
      isSameUser={isSameUser}
    />
  );
}

export default Message;
