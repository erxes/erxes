import React from 'react';
import Button from '../../../common/Button';

import FormControl from '../../../common/form/Control';
import { getConfigColor } from '../../../common/utils';
import { NotificationList } from '../../../styles/main';
import { TabContainers, TabTitle, Wrapper } from '../../../styles/tasks';
import { INotification, IUser } from '../../../types';
import Alert from '../../../utils/Alert';
import DataWithLoader from '../DataWithLoader';
import Row from './Row';
import Notifications from '../../containers/notifications/List';

type Props = {
  //   notifications: INotification[];
  count: number;
  currentUser: IUser;
  //   loading: boolean;
  //   refetch?: () => void;
  //   markAsRead: (notificationIds?: string[]) => void;
  config: any;
};

const List = (props: Props) => {
  //   const { loading, notifications, count } = props;
  const { config, count, currentUser } = props;

  const [currentTab, setCurrentTab] = React.useState('Recent');
  // return (
  //   <DataWithLoader
  //     data={content}
  //     loading={loading}
  //     count={count}
  //     emptyText="Looks like you are all caught up!"
  //     emptyImage="/images/actions/17.svg"
  //   />
  // );

  const tabTitles = ['Recent', 'Unread'];

  const requireRead = currentTab === 'Unread';

  // console.log('requireRead', requireRead);

  return (
    <>
      <TabContainers>
        {tabTitles.map((title) => (
          <TabTitle
            key={title}
            active={currentTab === title}
            color={getConfigColor(config, 'activeTabColor')}
            onClick={() => setCurrentTab(title)}
          >
            {title}
          </TabTitle>
        ))}
      </TabContainers>

      <Notifications
        count={count}
        currentUser={currentUser}
        requireRead={requireRead}
      />
    </>
  );
};

export default List;
