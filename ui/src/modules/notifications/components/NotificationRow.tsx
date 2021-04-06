import classNames from 'classnames';
import dayjs from 'dayjs';
import { IUser } from 'modules/auth/types';
import NameCard from 'modules/common/components/nameCard/NameCard';
import { IRouterProps } from 'modules/common/types';
import React from 'react';
import { withRouter } from 'react-router-dom';
import xss from 'xss';
import { INotification } from '../types';
import NotificationIcon from './NotificationIcon';
import {
  AvatarSection,
  Content,
  CreatedDate,
  CreatedUser,
  InfoSection
} from './styles';

interface IProps extends IRouterProps {
  notification: INotification;
  markAsRead: (notificationIds?: string[]) => void;
  createdUser?: IUser;
  isList?: boolean;
}

class NotificationRow extends React.Component<IProps> {
  markAsRead = () => {
    const { notification, markAsRead } = this.props;

    if (!notification.isRead) {
      markAsRead([notification._id]);
    }

    const params = notification.link.split('?');

    this.props.history.replace({
      pathname: params[0],
      state: { from: 'notification' },
      search: `?${params[1]}`
    });
  };

  getTitle = (title, user) => {
    if (!user) {
      return title.replace('{userName}', '');
    }

    if (!user.details || user.details.fullName) {
      return title.replace('{userName}', user.email);
    }

    return title.replace('{userName}', user.details.fullName);
  };

  renderContent(content: string, type: string) {
    if (!type.includes('conversation')) {
      return <b> {content}</b>;
    }

    return (
      <Content
        dangerouslySetInnerHTML={{ __html: xss(content) }}
        isList={this.props.isList}
      />
    );
  }

  renderCreatedUser() {
    const { notification, isList } = this.props;
    const { createdUser } = notification;

    let name = 'system';

    if (createdUser) {
      name = createdUser.details
        ? createdUser.details.fullName || ''
        : createdUser.username || createdUser.email;
    }

    return (
      <CreatedUser isList={isList}>
        {name}
        <span>
          {notification.action}
          {this.renderContent(notification.content, notification.notifType)}
        </span>
      </CreatedUser>
    );
  }

  render() {
    const { notification, isList } = this.props;
    const { isRead, createdUser } = notification;
    const classes = classNames({ unread: !isRead });

    return (
      <li className={classes} onClick={this.markAsRead}>
        <AvatarSection>
          <NameCard.Avatar
            user={createdUser}
            size={30}
            icon={<NotificationIcon notification={notification} />}
          />
        </AvatarSection>
        <InfoSection>
          {this.renderCreatedUser()}
          <CreatedDate isList={isList}>
            {dayjs(notification.date).format('DD MMM YYYY, HH:mm')}
          </CreatedDate>
        </InfoSection>
      </li>
    );
  }
}

export default withRouter<IProps>(NotificationRow);
