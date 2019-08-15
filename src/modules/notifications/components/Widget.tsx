import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';
import Label from 'modules/common/components/Label';
import { __ } from 'modules/common/utils';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import NotificationsLatest from '../containers/NotificationsLatest';
import { NotifButton, PopoverHeader } from './styles';

type Props = {
  currentUser: IUser;
  unreadCount: number;
};

type State = {
  activeFirst: boolean;
};

class Widget extends React.Component<Props, State> {
  update = () => {
    // rerender component
    this.forceUpdate();
  };

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
    const { currentUser } = this.props;

    const popoverNotification = (
      <Popover id="npopover" className="notification-popover">
        <PopoverHeader>{__('Notifications')}</PopoverHeader>
        <NotificationsLatest currentUser={currentUser} update={this.update} />
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
