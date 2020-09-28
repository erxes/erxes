import { IBotData } from 'modules/inbox/types';
import * as React from 'react';

type Props = {
  botData: IBotData;
};

const btnStyle = {
  marginRight: 8,
  borderWidth: 1,
  borderColor: 'blue',
  backgroundColor: 'white',
  color: 'black'
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
    return (
      <button key={index} style={btnStyle}>
        {item.title}
      </button>
    );
  };

  return (
    <div>
      {wrapped ? <b>{wrapped.text}</b> : null}
      <div style={{ display: 'inline-block' }}>
        <div style={{ padding: 8 }}>
          {quick_replies ? quick_replies.map(renderButton) : null}
        </div>
      </div>
    </div>
  );
}
