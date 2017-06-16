import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Dropdown, MenuItem, Popover, Badge } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { NameCard, DropdownToggle } from '/imports/react-ui/common';
import { NotificationsLatest } from '../containers';

const propTypes = {
  unreadCount: PropTypes.number.isRequired,
};

class QuickNavigation extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.unreadCount < this.props.unreadCount) {
      const audio = new Audio('/sound/notify.mp3');
      audio.play();
    }
  }

  render() {
    const unreadCount = this.props.unreadCount;
    const user = Meteor.user();
    const popoverNotification = (
      <Popover id="popover-notification" title="Notifications">
        <NotificationsLatest />
      </Popover>
    );
    return (
      <nav className="quick-nav">
        <div className="nav-item">
          <OverlayTrigger
            trigger="click"
            rootClose
            placement="bottom"
            containerPadding={15}
            overlay={popoverNotification}
          >
            <div className="action-button">
              <i className="ion-android-notifications" />
              <Badge>
                {unreadCount !== 0 ? unreadCount : null}
              </Badge>
            </div>
          </OverlayTrigger>
        </div>
        <div className="nav-item">
          <Dropdown id="dropdown-user" pullRight>
            <DropdownToggle bsRole="toggle">
              <NameCard.Avatar user={user} />
            </DropdownToggle>
            <Dropdown.Menu>
              <NameCard user={user} />
              <MenuItem divider />
              <MenuItem href={FlowRouter.path('/settings/profile')}>
                Edit Profile
              </MenuItem>
              <MenuItem href={FlowRouter.path('settings/change-password')}>
                Change password
              </MenuItem>
              <MenuItem divider />
              <MenuItem href={FlowRouter.path('/logout')}>Sign out</MenuItem>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </nav>
    );
  }
}

QuickNavigation.propTypes = propTypes;

export default QuickNavigation;
