import * as React from 'react';
import { IBotData } from '../../types';
import { BOT_CUSTOM_TYPES } from './constants';

type Props = {
  conversationId?: string;
  message: IBotData;
  replyAutoAnswer: (message: string, payload: string, type: string) => void;
  sendTypingInfo: (conversationId: string, text: string) => void;
  color?: string;
};

export default function CustomMessage({
  message,
  replyAutoAnswer,
  color
}: Props) {
  if (!message) {
    return null;
  }

  const { wrapped, component, type } = message;

  if (component !== BOT_CUSTOM_TYPES.QUICK_REPLY) {
    return null;
  }

  const { quick_replies } = message;

  const onSelectReply = (title: string, payload: string) => {
    return replyAutoAnswer(title, payload, type);
  };

  const renderButton = (
    item: { title: string; payload: string },
    index: number
  ) => {
    const handleClick = () => onSelectReply(item.title, item.payload);

    return (
      <div
        key={index}
        className="reply-button"
        onClick={handleClick}
        style={{ borderColor: color }}
      >
        {item.title}
      </div>
    );
  };

  return (
    <>
      {wrapped ? <div className="erxes-message top">{wrapped.text}</div> : null}
      <div className="bot-message">
        <div className="quick-replies">
          {quick_replies ? quick_replies.map(renderButton) : null}
        </div>
      </div>
    </>
  );
}
