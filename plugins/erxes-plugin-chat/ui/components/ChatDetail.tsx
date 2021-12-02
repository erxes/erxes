import React, { useState } from 'react';

import MessageList from '../containers/MessageList';
import PageContent from 'erxes-ui/lib/layout/components/PageContent';
import FormControl from 'erxes-ui/lib/components/form/Control';
import Button from 'erxes-ui/lib/components/Button';

type Props = {
  sendMessage: (message: string) => void;
  chatId?: string;
  userIds?: string[];
};

export default function ChatDetailContainer({
  chatId,
  userIds,
  sendMessage
}: Props) {
  const [message, setMessage] = useState('');

  const onSendMessage = () => {
    sendMessage(message);

    setMessage('');
  };

  const renderMessageList = () => {
    if (chatId || userIds) {
      return <MessageList chatId={chatId} userIds={userIds} />;
    }

    return <></>;
  };

  return (
    <PageContent transparent={false} center={true}>
      {renderMessageList()}

      <div style={{ padding: '20px' }}>
        <FormControl
          type='text'
          name='description'
          max={250}
          value={message}
          componentClass='textarea'
          onChange={(e: any) => setMessage(e.target.value)}
          placeholder='Type here'
        />
        <br />
        <Button
          style={{ float: 'right' }}
          btnStyle='success'
          type='submit'
          onClick={onSendMessage}
        >
          Send
        </Button>
      </div>
    </PageContent>
  );
}
