import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import Avatar from '@erxes/ui/src/components/nameCard/Avatar';
import Button from '@erxes/ui/src/components/Button';
import CommonSidebar from '@erxes/ui/src/layout/components/Sidebar';
import Box from '@erxes/ui/src/components/Box';
import { ChatListStyle } from '../styles';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { __, router } from '@erxes/ui/src/utils';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
import queryString from 'query-string';
import { FormControl } from '@erxes/ui/src/';

type Props = {
  directChats: any[];
  groupChats: any[];
  startGroupChat: (name: string, userIds: string[]) => void;
};

type FinalProps = {} & Props & IRouterProps & { currentUser: IUser };

function SidebarContainer(props: FinalProps) {
  const { directChats, groupChats, history, location, currentUser } = props;
  const queryParams = queryString.parse(location.search);

  const [userIds, setUserIds] = useState(queryParams.userIds || []);
  const [userId, setUserId] = useState(queryParams.userId || '');
  const [name, setName] = useState('');

  const renderChats = () => {
    const onAssignedUserSelect = userId => {
      router.removeParams(history, '_id', 'userIds');

      setUserId(userId);
      router.setParams(history, { userId });
    };

    const onChangeUsers = _userIds => {
      setUserIds(_userIds);
    };

    const onStartGroupChat = () => {
      props.startGroupChat(name, userIds);

      router.removeParams(history, 'userIds');

      setUserIds([]);
      setName('');
    };

    const renderChat = chat => {
      const users = chat.participantUsers || [];

      const filteredUsers =
        users.length > 1 ? users.filter(u => u._id !== currentUser._id) : users;

      return (
        <li key={chat._id}>
          {filteredUsers.map(user => (
            <Link key={user._id} to={`/erxes-plugin-chat/home?_id=${chat._id}`}>
              {user.details.fullName || user.email}
            </Link>
          ))}
          <br />
          <span>{dayjs(chat.createdAt).format('lll')}</span>
        </li>
      );
    };

    return (
      <>
        <Box title={'Group chats'} isOpen={true} name="showGroupChats">
          <div style={{ padding: '20px' }}>
            <SelectTeamMembers
              label={__('Choose team member')}
              name="assignedUserIds"
              initialValue={userIds}
              onSelect={onChangeUsers}
            />
            <br />
            <FormControl
              placeholder="Name"
              value={name}
              onChange={(e: any) => setName(e.target.value)}
            />
            <br />
            <Button style={{ float: 'right' }} onClick={onStartGroupChat}>
              Start group chat
            </Button>
          </div>
          <ChatListStyle>
            {groupChats.map(chat => (
              <li key={chat._id}>
                <Link to={`/erxes-plugin-chat/home?_id=${chat._id}`}>
                  {chat.name}
                </Link>
                <br />
                <br />
                <div style={{ overflow: 'hidden' }}>
                  {chat.participantUsers.map(user => (
                    <div
                      key={user._id}
                      style={{ float: 'left', margin: '0 5px' }}
                    >
                      <Avatar user={user} size={30} />
                    </div>
                  ))}
                </div>
                <br />
                <div>{dayjs(chat.createdAt).format('lll')}</div>
              </li>
            ))}
          </ChatListStyle>
        </Box>
        <br />
        <Box title={'Direct chats'} isOpen={true} name="showDirectChats">
          <div style={{ padding: '20px' }}>
            <SelectTeamMembers
              label={__('Choose team member')}
              name="assignedUserId"
              initialValue={userId}
              onSelect={onAssignedUserSelect}
              multi={false}
            />
          </div>
          <ChatListStyle>
            {directChats.map(chat => renderChat(chat))}
          </ChatListStyle>
        </Box>
      </>
    );
  };

  return (
    <CommonSidebar wide={true} full={true} hasBorder>
      {renderChats()}
    </CommonSidebar>
  );
}

const WithRouter = withCurrentUser(withRouter(SidebarContainer));

const Sidebar = (props: Props) => {
  return <WithRouter {...props} />;
};

export default Sidebar;
