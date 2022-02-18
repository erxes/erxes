import { IBotData } from '@erxes/ui-inbox/src/inbox/types';
import * as React from 'react';
import { MessageContent } from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/conversation/styles';
import { QuickReplies, ReplyButton } from './styles';

type Props = {
  botData: IBotData;
};

export default function CustomMessage({ botData }: Props) {
  if (!botData) {
    return null;
  }

  const { wrapped, component } = botData;

  if (component !== 'QuickReplies') {
    return null;
  }

  const { quick_replies } = botData;

  const renderButton = (
    item: { title: string; payload: string },
    index: number
  ) => {
    return <ReplyButton key={index}>{item.title}</ReplyButton>;
  };

  return (
    <>
      {wrapped ? (
        <MessageContent staff={true}>{wrapped.text}</MessageContent>
      ) : null}
      <QuickReplies>
        {quick_replies ? quick_replies.map(renderButton) : null}
      </QuickReplies>
    </>
  );
}
