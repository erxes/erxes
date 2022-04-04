import React, { useState } from 'react';

import MessageList from '../containers/MessageList';
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';

type Props = {
  sendMessage: (message: string) => void;
  chatId?: string;
};

export default function ChatDetailContainer({ chatId, sendMessage }: Props) {
  const [message, setMessage] = useState('');

  const onSendMessage = () => {
    sendMessage(message);

    setMessage('');
  };

  const renderMessageList = () => {
    if (chatId) {
      return <MessageList chatId={chatId} />;
    }

    return <></>;
  };

  return (
    <PageContent transparent={false} center={true}>
      {renderMessageList()}

      <div style={{ padding: '20px' }}>
        <FormControl
          type="text"
          name="description"
          max={250}
          value={message}
          componentClass="textarea"
          onChange={(e: any) => setMessage(e.target.value)}
          placeholder="Type here"
        />
        <br />
        <Button
          style={{ float: 'right' }}
          btnStyle="success"
          type="submit"
          onClick={onSendMessage}
        >
          Send
        </Button>
      </div>
    </PageContent>
  );
}
