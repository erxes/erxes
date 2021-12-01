import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import CommonSidebar from 'erxes-ui/lib/layout/components/Sidebar';

type Props = {
  chats: any[];
};

export default function Sidebar(props: Props) {
  const { chats } = props;

  const renderChats = () => {
    if (chats.length === 0) {
      return <div>No chats</div>;
    }

    return (
      <ol>
        {chats.map(chat => (
          <li key={chat._id}>
            <Link to={`/erxes-plugin-chat/home?_id=${chat._id}`}>
              {chat.name}
            </Link>
            <br />
            {chat.createdUser.email}
            <br />
            <span>{dayjs(chat.createdAt).format('lll')}</span>
          </li>
        ))}
      </ol>
    );
  };

  return (
    <CommonSidebar wide={true} full={true}>
      {renderChats()}
    </CommonSidebar>
  );
}
