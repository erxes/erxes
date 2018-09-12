import { EmptyState, Icon, Label } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import React, { Component } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { NotificationsLatest } from '../containers';
import {
  NotifButton,
  NotifCount,
  PopoverContent,
  PopoverHeader,
  Toggle,
  Toggler
} from './styles';

class Widget extends Component<{ unreadCount: number }, { activeFirst: boolean }> {
  constructor(props) {
    super(props);

    this.state = { activeFirst: false };

    this.update = this.update.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  update() {
    // rerender component
    this.forceUpdate();
  }

  toggle() {
    this.setState({ activeFirst: !this.state.activeFirst });
  }

  renderPopoverContent() {
    if (this.state.activeFirst) {
      return (
        <PopoverContent>
          <EmptyState
            text={__('Coming soon').toString()}
            image="/images/robots/robot-05.svg"
          />
        </PopoverContent>
      );
    }

    return <NotificationsLatest update={this.update} />;
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
    const isActive = this.state.activeFirst;

    const popoverNotification = (
      <Popover id="npopover" className="notification-popover">
        <PopoverHeader>
          <Toggler onClick={this.toggle} activeFirst={isActive}>
            <Toggle isActive={isActive}>
              <Icon icon="head-1" /> {__('AI')}
            </Toggle>
            <Toggle isActive={!isActive}>
              <NotifCount>
                <Icon icon="alarm" />
                {this.renderUnreadCount()}
              </NotifCount>
              {__('Notifications')}
            </Toggle>
          </Toggler>
        </PopoverHeader>
        {this.renderPopoverContent()}
      </Popover>
    );

    return (
      <OverlayTrigger
        trigger="click"
        rootClose
        placement="top"
        containerPadding={25}
        overlay={popoverNotification}
        shouldUpdatePosition
      >
        <NotifButton>
          <img src="/images/robots/robot-head.svg" alt="ai robot" />
          {this.renderUnreadCount()}
        </NotifButton>
      </OverlayTrigger>
    );
  }
}

export default Widget;