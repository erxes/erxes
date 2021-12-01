import React, { useState } from 'react';

import MessageList from '../containers/MessageList';
import PageContent from 'erxes-ui/lib/layout/components/PageContent';

type Props = {
  sendMessage: (message: string) => void;
  chatId: string;
};

export default function ChatDetailContainer({ chatId, sendMessage }: Props) {
  const [message, setMessage] = useState('');

  const onSendMessage = () => {
    sendMessage(message);

    setMessage('');
  };

  return (
    <PageContent transparent={false} center={true}>
      <MessageList chatId={chatId} />
      <div style={{ paddingTop: '20px' }}>
        <textarea value={message} onChange={e => setMessage(e.target.value)} />

        <button onClick={onSendMessage}>Send</button>
      </div>
    </PageContent>
  );
}
