import React from 'react';
// erxes
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
// local
import ChatContent from '../components/ChatContent';
import ChatInfo from '../containers/ChatInfo';
import ChatContacts from '../containers/ChatContacts';

type Props = {
  chatId: string;
};

const Chat = (props: Props) => {
  const { chatId } = props;

  return (
    <Wrapper
      transparent={true}
      header={
        <Wrapper.Header title={'Chat'} breadcrumb={[{ title: 'Chat' }]} />
      }
      leftSidebar={<ChatContacts />}
      rightSidebar={chatId && <ChatInfo chatId={chatId} />}
      content={
        chatId ? (
          <ChatContent chatId={chatId} />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <h3>Select a chat or start a new conversation</h3>
          </div>
        )
      }
    />
  );
};

export default Chat;
