import * as React from 'react';
import { IBotData } from '../../types';
import { BOT_CUSTOM_TYPES } from './constants';

type Props = {
  conversationId: string;
  message: IBotData;
  replyAutoAnswer: (message: string, payload: string) => void;
  sendTypingInfo: (conversationId: string, text: string) => void;
};

const btnStyle = {
  marginRight: 8,
  borderWidth: 1,
  borderColor: 'blue',
  backgroundColor: 'white',
  color: 'black'
};

export default function CustomMessage({ message, replyAutoAnswer }: Props) {
  if (!message) {
    return null;
  }

  const { wrapped, component } = message;

  if (component !== BOT_CUSTOM_TYPES.QUICK_REPLY) {
    return null;
  }

  const { quick_replies } = message;

  const onSelectReply = (title: string, payload: string) => {
    return replyAutoAnswer(title, payload);
  };

  const renderButton = (
    item: { title: string; payload: string },
    index: number
  ) => {
    const handleClick = () => onSelectReply(item.title, item.payload);

    return (
      <button key={index} style={btnStyle} onClick={handleClick}>
        {item.title}
      </button>
    );
  };

  return (
    <div className="bot-message">
      {wrapped ? <b>{wrapped.text}</b> : null}
      <div style={{ display: 'inline-block' }}>
        <div style={{ padding: 8 }}>
          {quick_replies ? quick_replies.map(renderButton) : null}
        </div>
      </div>
    </div>
  );
}
