import React, { useState } from 'react';
// erxes
import PageContent from '@erxes/ui/src/layout/components/PageContent';
// local
import ChatHistory from '../containers/ChatHistory';
import ChatInput from '../containers/ChatInput';
import { ChatContentBody } from '../styles';

type Props = {
  chatId: string;
};

const ChatContent = (props: Props) => {
  const { chatId } = props;
  const [reply, setReply] = useState<any>(null);

  return (
    <PageContent transparent={false} center={true}>
      <ChatContentBody>
        <ChatHistory chatId={chatId} setReply={setReply} />
        <ChatInput chatId={chatId} setReply={setReply} reply={reply} />
      </ChatContentBody>
    </PageContent>
  );
};

export default ChatContent;
