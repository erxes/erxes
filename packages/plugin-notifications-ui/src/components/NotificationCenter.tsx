import React from 'react';
import { INotification } from '@erxes/ui-notifications/src/types';
import { Contents, HeightedWrapper } from '@erxes/ui/src/layout/styles';
import Header from '@erxes/ui/src/layout/components/Header';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { RowContent, RowItem } from './styles';
import NotificationRow from '@erxes/ui-notifications/src/components/NotificationRow';
import {
  AvatarSection,
  Content,
  CreatedDate,
  CreatedUser,
  InfoSection,
} from '@erxes/ui-notifications/src/components/styles';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import dayjs from 'dayjs';
import RoundedBackgroundIcon from '@erxes/ui/src/components/RoundedBackgroundIcon';
import xss from 'xss';
import { setParams } from '@erxes/ui/src/utils/router';
import { router } from '@erxes/ui';
import { useLocation, useNavigate } from 'react-router-dom';
import EditForm from '@erxes/ui-tasks/src/boards/containers/editForm/EditForm';
import TaskEditForm from '@erxes/ui-tasks/src/tasks/components/TaskEditForm';

type Props = {
  queryParams: any;
  notifications: INotification[];
};

const NotificationItem = ({ notification }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRead, createdUser, notifType } = notification;
  const getIcon = () => {
    let icon = 'user-check';

    if (notifType.includes('conversation')) {
      icon = 'comment-1';
    }

    if (notifType.includes('deal')) {
      icon = 'dollar-alt';
    }

    if (notifType.includes('ticket')) {
      icon = 'postcard';
    }

    if (notifType.includes('task')) {
      icon = 'file-check';
    }
    if (notifType.includes('purchase')) {
      icon = 'dollar-alt';
    }

    return icon;
  };

  const renderContent = (content: string, type: string) => {
    if (!type.includes('conversation')) {
      return <b> {content}</b>;
    }

    return (
      <Content
        dangerouslySetInnerHTML={{ __html: xss(content) }}
        isList={true}
      />
    );
  };

  const renderCreatedUser = () => {
    let name = 'system';

    if (createdUser) {
      name = createdUser.details
        ? createdUser.details.fullName || ''
        : createdUser.username || createdUser.email;
    }

    return (
      <CreatedUser isList={true}>
        {name}
        <span>
          {notification.action}
          {renderContent(notification.content, notification.notifType)}
        </span>
      </CreatedUser>
    );
  };

  return (
    <RowItem
    // onClick={() => router.setParams(navigate,location,{targetId:notification.})}
    >
      <RowContent>
        {/* <NotificationRow
                  notification={notification}
                  key={key}
                  markAsRead={() => console.log()}
                /> */}
        <AvatarSection>
          <NameCard.Avatar
            user={createdUser}
            size={30}
            icon={<RoundedBackgroundIcon icon={getIcon()} />}
          />
        </AvatarSection>
        <InfoSection>
          {renderCreatedUser()}
          <CreatedDate>
            {dayjs(notification.date).format('DD MMM YYYY, HH:mm')}
          </CreatedDate>
        </InfoSection>
      </RowContent>
    </RowItem>
  );
};

const NotificationCenter = ({ notifications, queryParams }: Props) => {
  console.log(queryParams);

  const renderContent = () => {
    // return <TaskEditForm/>
    return <></>;
  };

  return (
    <HeightedWrapper>
      <Header title={'Notification center'} queryParams={queryParams} />
      <Contents>
        <Sidebar full hasBorder={true}>
          {notifications.map((notification, key) => (
            <NotificationItem key={key} notification={notification} />
          ))}
        </Sidebar>
        <div>shit</div>
      </Contents>
    </HeightedWrapper>
  );
};

export default NotificationCenter;
