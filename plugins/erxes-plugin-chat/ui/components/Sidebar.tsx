import React from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

import CommonSidebar from 'erxes-ui/lib/layout/components/Sidebar';
import Box from 'erxes-ui/lib/components/Box';
import { ChatListStyle } from '../styles';
import SelectTeamMembers from 'erxes-ui/lib/team/containers/SelectTeamMembers';
import { __, router } from 'erxes-ui/lib/utils';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from 'erxes-ui/lib/types';

type Props = {
  directChats: any[];
};

function Sidebar(props: Props & IRouterProps) {
  const { directChats, history } = props;

  const renderDirectChats = () => {
    const onAssignedUserSelect = userId => {
      router.setParams(history, { userIds: userId, _id: '' });
    };

    return (
      <Box title={'Direct chats'} isOpen={true} name='showDirectChats'>
        <div style={{ padding: '20px' }}>
          <SelectTeamMembers
            label={__('Choose team member')}
            name='assignedUserIds'
            initialValue={''}
            onSelect={onAssignedUserSelect}
            multi={false}
          />
        </div>
        <ChatListStyle>
          {directChats.map(chat => (
            <li key={chat._id}>
              {chat.participantUsers.map(user => (
                <Link to={`/erxes-plugin-chat/home?_id=${chat._id}`}>
                  {user.details.fullName || user.email}
                </Link>
              ))}
              <br />
              <span>{dayjs(chat.createdAt).format('lll')}</span>
            </li>
          ))}
        </ChatListStyle>
      </Box>
    );
  };

  return (
    <CommonSidebar wide={true} full={true}>
      {renderDirectChats()}
    </CommonSidebar>
  );
}

export default withRouter(Sidebar);
