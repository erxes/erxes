import { Icon, Label } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { NotificationsLatest } from '../containers';
import { NotifButton, PopoverHeader } from './styles';

class Widget extends React.Component<
  { unreadCount: number },
  { activeFirst: boolean }
> {
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
    const popoverNotification = (
      <Popover id="npopover" className="notification-popover">
        <PopoverHeader>{__('Notifications')}</PopoverHeader>
        <NotificationsLatest update={this.update} />
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
