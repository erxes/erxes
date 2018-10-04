import { Icon, Label } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { NotificationsLatest } from '../containers';
import {  NotifButton, PopoverHeader } from './styles';

class Widget extends React.Component<{ unreadCount: number }, { activeFirst: boolean }> {
  constructor(props) {
    super(props);

    this.update = this.update.bind(this);
  }

  update() {
    // rerender component
    this.forceUpdate();
  }

  renderUnreadCount() {
    const { unreadCount } = this.props;

    if (unreadCount && unreadCount !== 0) {
      return (
        <Label shake lblStyle="danger" ignoreTrans>
          {unreadCount}
        </Label>
      );
    }

    return null;
  }

  render() {
    const popoverNotification = (
      <Popover id="npopover" className="notification-popover">
        <PopoverHeader>
          {__('Notifications')}
        </PopoverHeader>
        <NotificationsLatest update={this.update} />
      </Popover>
    );

    return (
      <OverlayTrigger
        trigger="click"
        rootClose
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