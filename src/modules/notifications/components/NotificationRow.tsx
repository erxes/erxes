import classNames from 'classnames';
import { IUser } from 'modules/auth/types';
import { Icon } from 'modules/common/components';
import { NameCard } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import moment from 'moment';
import React from 'react';
import { withRouter } from 'react-router';
import xss from 'xss';
import { INotification } from '../types';
import { NotificationIcon } from './';
import { Content, CreatedDate, CreatedUser, FlexRow } from './styles';

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

  getTitle = (title, user) => {
    if (!user) {
      return title.replace('{userName}', '');
    }

    if (!(user.details && user.details.fullName)) {
      return title.replace('{userName}', user.email);
    }

    return title.replace('{userName}', user.details.fullName);
  };

  renderContent(content: string, type: string) {
    if (!type.includes('conversation')) {
      return null;
    }

    return <Content dangerouslySetInnerHTML={{ __html: xss(content) }} />;
  }

  renderAction(notification: INotification) {
    if (notification.notifType.includes('conversation')) {
      return <span>{notification.action}</span>;
    }

    return (
      <span>
        {notification.action}
        <b> {notification.content}</b>
      </span>
    );
  }

  render() {
    const { notification } = this.props;
    const { isRead, createdUser } = notification;
    const classes = classNames({ unread: !isRead });
    // tslint:disable-next-line:no-console
    console.log(notification);
    return (
      <li className={classes} onClick={this.markAsRead}>
        <div>
          <FlexRow>
            <NameCard.Avatar
              user={createdUser}
              size={30}
              icon={<NotificationIcon notification={notification} />}
            />
            <CreatedUser>
              {createdUser.details
                ? createdUser.details.fullName
                : createdUser.username || createdUser.email}
              {this.renderAction(notification)}
            </CreatedUser>
          </FlexRow>
          {this.renderContent(notification.content, notification.notifType)}
          <CreatedDate>
            {moment(notification.date).format('DD MMM YYYY, HH:mm')}
          </CreatedDate>
        </div>
      </li>
    );
  }
}

export default withRouter<IProps>(NotificationRow);
