import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import { __ } from 'modules/common/utils';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import NotificationsLatest from '../containers/NotificationsLatest';
import { INotification } from '../types';
import { NotifButton, PopoverHeader } from './styles';

type Props = {
  unreadCount: number;
  notifications: INotification[];
  markAsRead: () => void;
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
    const { notifications, markAsRead, isLoading } = this.props;

    const popoverProps = { notifications, markAsRead, isLoading };
    const popoverNotification = (
      <Popover id="npopover" className="notification-popover">
        <PopoverHeader>{__('Notifications')}</PopoverHeader>
        <NotificationsLatest {...popoverProps} />
      </Popover>
    );

    return (
      <OverlayTrigger
        trigger="click"
        rootClose={true}
        placement="bottom"
        containerPadding={20}
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
