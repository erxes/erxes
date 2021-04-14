import React from 'react';
import { IMessage } from '../../../../../types';
import AppMessage from './AppMessage';
import FormMessage from './FormMessage';
import MessageBot from './MessageBot';
import SimpleMessage from './SimpleMessage';

type Props = {
  message: IMessage;
  isSameUser: boolean;
  conversationFirstMessage?: IMessage;
  kind: string;
};

function Message(props: Props) {
  const { message, isSameUser, kind } = props;

  if (message.formWidgetData) {
    return <FormMessage {...props} />;
  }

  if (message.messengerAppData) {
    return <AppMessage message={message} />;
  }

  if (message.botData) {
    return <MessageBot message={message} />;
  }

  return (
    <SimpleMessage
      message={message}
      isStaff={message.userId ? true : false}
      isSameUser={isSameUser}
      kind={kind}
    />
  );
}

export default Message;
