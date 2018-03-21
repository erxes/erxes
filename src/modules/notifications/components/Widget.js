import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { NotificationsLatest } from '../containers';
import { Label, EmptyState, Icon } from 'modules/common/components';
import {
  NotifButton,
  Toggler,
  Toggle,
  PopoverHeader,
  PopoverContent,
  NotifCount
} from './styles';

class Widget extends Component {
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
    const { __ } = this.context;

    if (this.state.activeFirst) {
      return (
        <PopoverContent>
          <EmptyState
            text={__('Coming soon')}
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
    const { __ } = this.context;

    const popoverNotification = (
      <Popover id="npopover" className="notification-popover">
        <PopoverHeader>
          <Toggler onClick={this.toggle} activeFirst={isActive}>
            <Toggle isActive={isActive}>
              <Icon icon="android-wifi" /> {__('AI')}
            </Toggle>
            <Toggle isActive={!isActive}>
              <NotifCount>
                <Icon icon="android-notifications-none" />
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

Widget.propTypes = {
  unreadCount: PropTypes.number
};

Widget.contextTypes = {
  __: PropTypes.func
};

export default Widget;
