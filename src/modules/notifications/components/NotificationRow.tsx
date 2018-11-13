import classNames from 'classnames';
import { IUser } from 'modules/auth/types';
import { NameCard } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import * as moment from 'moment';
import * as React from 'react';
import { withRouter } from 'react-router';
import { INotification } from '../types';

interface IProps extends IRouterProps {
  notification: INotification;
  markAsRead: (notificationIds?: string[]) => void;
  createdUser?: IUser;
}

class NotificationRow extends React.Component<IProps> {
  markAsRead = () => {
    const { history, notification, markAsRead } = this.props;

    if (!notification.isRead) {
      markAsRead([notification._id]);
    }

    history.push(notification.link);
  };

  render() {
    const { notification } = this.props;
    const { isRead, createdUser } = notification;
    const classes = classNames({ unread: !isRead });

    return (
      <li className={classes} onClick={this.markAsRead}>
        <NameCard
          user={createdUser}
          firstLine={notification.title}
          secondLine={moment(notification.date).format('DD MMM YYYY, HH:mm')}
        />
      </li>
    );
  }
}

export default withRouter<IProps>(NotificationRow);
