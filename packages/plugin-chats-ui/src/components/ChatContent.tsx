import React, { useState } from 'react';
// erxes
import PageContent from '@erxes/ui/src/layout/components/PageContent';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
// local
import ChatHistory from '../containers/ChatHistory';
import { ChatForm } from '../styles';

type Props = {
  chatId: string;
  sendMessage: (message: string) => void;
};

const ChatContent = (props: Props) => {
  const { chatId, sendMessage } = props;
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    sendMessage(message);

    setMessage('');
  };

  const handleKeyPress = (event: any) => {
    if (event.keyCode === 13 && event.shiftKey === false) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <PageContent transparent={false} center={true}>
      <ChatHistory chatId={chatId} />
      <hr />
      <ChatForm>
        <FormControl
          type="text"
          name="description"
          placeholder="Aa"
          componentClass="textarea"
          max={250}
          onKeyDown={handleKeyPress}
          onChange={(e: any) => setMessage(e.target.value)}
          value={message}
        />
        <br />
        <Button
          style={{ float: 'right' }}
          btnStyle="primary"
          onClick={handleSendMessage}
        >
          Send
        </Button>
      </ChatForm>
    </PageContent>
  );
};

export default ChatContent;
