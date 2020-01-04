import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import { __ } from 'modules/common/utils';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import NotificationsLatest from '../containers/NotificationsLatest';
import { INotification } from '../types';
import { NotifButton, PopoverHeader, PopoverLink } from './styles';

type Props = {
  unreadCount: number;
  notifications: INotification[];
  markAsRead: () => void;
  showNotifications: (requireRead: boolean) => void;
  markAsAllRead: () => void;
  isLoading: boolean;
};

type State = {
  activeFirst: boolean;
};

class Widget extends React.Component<Props, State> {
  renderUnreadCount() {
    const { unreadCount } = this.props;

    if (unreadCount && unreadCount !== 0) {
      return (
        <Label shake={true} lblStyle="danger" ignoreTrans={true}>
          {unreadCount}
        </Label>
      );
    }

    return null;
  }

  render() {
    const {
      notifications,
      markAsRead,
      isLoading,
      showNotifications,
      markAsAllRead
    } = this.props;

    const popoverProps = {
      notifications,
      markAsRead,
      isLoading,
      requireRead: true,
      markAsAllRead
    };
    const popoverNotification = (
      <Popover id="npopover" className="notification-popover">
        <PopoverHeader>
          <PopoverLink>
            <span onClick={showNotifications.bind(this, false)}>
              {__('Notifications')}
            </span>
          </PopoverLink>
          <PopoverLink>
            <span onClick={showNotifications.bind(this, true)}>
              {' '}
              {__('Show unread')}
            </span>
          </PopoverLink>
        </PopoverHeader>
        <NotificationsLatest {...popoverProps} />
      </Popover>
    );

    return (
      <OverlayTrigger
        trigger="click"
        rootClose={true}
        placement="bottom"
        overlay={popoverNotification}
      >
        <NotifButton>
          <Icon icon="alarm-2" />
          {this.renderUnreadCount()}
        </NotifButton>
      </OverlayTrigger>
    );
  }
}

export default Widget;
