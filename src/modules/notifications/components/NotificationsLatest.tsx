import { EmptyState } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { INotification } from '../types';
import { NotificationRow } from './';
import {
  NotificationList,
  NotificationSeeAll,
  NotificationWrapper,
  PopoverContent
} from './styles';

type Props = {
  notifications: INotification[];
  markAsRead: (notificationIds?: string[]) => void;
  update?: () => void;
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
    const { notifications, markAsRead } = this.props;
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
