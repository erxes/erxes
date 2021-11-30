import React from 'react';
import { Wrapper } from 'erxes-ui';
import Sidebar from 'erxes-ui/lib/layout/components/Sidebar';

type Props = {
  queryParams: any;
  chats: any[];
};

export default function Home(props: Props) {
  const { chats } = props;

  const renderChats = () => {
    if (chats.length === 0) {
      return <div>No chats</div>;
    }

    return (
      <ol>
        {chats.map(chat => (
          <li key={chat._id}>
            {chat.lastChatMessage ? chat.lastChatMessage.content : ''}
          </li>
        ))}
      </ol>
    );
  };

  const renderContent = (
    <Sidebar wide={true} full={true}>
      {renderChats()}
    </Sidebar>
  );

  return (
    <Wrapper
      transparent={true}
      header={
        <Wrapper.Header title={'Chat'} breadcrumb={[{ title: 'Chat' }]} />
      }
      content={renderContent}
    />
  );
}
