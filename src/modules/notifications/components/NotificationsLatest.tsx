import EmptyState from 'modules/common/components/EmptyState';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { INotification } from '../types';
import NotificationRow from './NotificationRow';
import {
  MarkAllRead,
  NotificationList,
  NotificationSeeAll,
  NotificationWrapper,
  PopoverContent
} from './styles';

type Props = {
  notifications: INotification[];
  markAsRead: (notificationIds?: string[]) => void;
  update?: () => void;
  markAsAllRead: () => void;
};

class NotificationsLatest extends React.Component<Props> {
  componentDidMount() {
    // update popover position
    const { update } = this.props;

    if (update) {
      update();
    }
  }

  render() {
    const { notifications, markAsRead, markAsAllRead } = this.props;
    const notifCount = notifications.length;

    const mainContent = (
      <React.Fragment>
        <NotificationList>
          {notifications.map((notif, key) => (
            <NotificationRow
              notification={notif}
              key={key}
              markAsRead={markAsRead}
            />
          ))}
        </NotificationList>
        <NotificationSeeAll>
          <Link to="/notifications">{__('See all')}</Link>
        </NotificationSeeAll>
        <MarkAllRead>
          <span onClick={markAsAllRead}>{__('Mark all as read')}</span>{' '}
        </MarkAllRead>
      </React.Fragment>
    );

    const emptyContent = (
      <PopoverContent>
        <EmptyState
          text={__('Looks like you are all caught up')}
          image="/images/actions/17.svg"
        />
      </PopoverContent>
    );

    const content = () => {
      if (notifCount === 0) {
        return emptyContent;
      }
      return <NotificationWrapper>{mainContent}</NotificationWrapper>;
    };

    return content();
  }
}

export default NotificationsLatest;
