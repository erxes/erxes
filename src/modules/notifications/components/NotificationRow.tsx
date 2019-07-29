import classNames from 'classnames';
import dayjs from 'dayjs';
import { IUser } from 'modules/auth/types';
import NameCard from 'modules/common/components/nameCard/NameCard';
import { IRouterProps } from 'modules/common/types';
import React from 'react';
import { withRouter } from 'react-router';
import xss from 'xss';
import { INotification } from '../types';
import NotificationIcon from './NotificationIcon';
import {
  AvatarSection,
  Content,
  ConversationContent,
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
      <ConversationContent>
        <Content dangerouslySetInnerHTML={{ __html: xss(content) }} />
      </ConversationContent>
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
          <CreatedUser isList={isList}>
            {createdUser.details
              ? createdUser.details.fullName
              : createdUser.username || createdUser.email}
            <span>
              {notification.action}
              {this.renderContent(notification.content, notification.notifType)}
            </span>
          </CreatedUser>
          <CreatedDate isList={isList}>
            {dayjs(notification.date).format('DD MMM YYYY, HH:mm')}
          </CreatedDate>
        </InfoSection>
      </li>
    );
  }
}

export default withRouter<IProps>(NotificationRow);
