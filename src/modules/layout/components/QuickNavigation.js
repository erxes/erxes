import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  OverlayTrigger,
  Dropdown,
  MenuItem,
  Popover,
  Badge
} from 'react-bootstrap';
import styled from 'styled-components';
import { NameCard, DropdownToggle, Icon } from 'modules/common/components';
import { UserHelper } from '../styles';
import { NotificationsLatest } from 'modules/notifications/containers';

const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  a {
    float: none;
    margin: 0 10px;
  }
`;

const NameCardWrapper = styled.div`
  padding: 10px 20px;
`;

const NavItem = styled.div`
  padding-left: 15px;
  display: table-cell;
  vertical-align: middle;
`;

const ActionButton = styled.div`
  color: #383838;
  font-size: 22px;
  cursor: pointer;
  position: relative;

  & .badge {
    position: absolute;
    top: 0;
    right: -9px;
    font-size: 10px;
    background-color: #f74040;
    padding: 3px 5px;
  }
`;

const QuickNavigation = ({ logout, currentUser }) => {
  const unreadCount = 0;
  const popoverNotification = (
    <Popover
      id="npopover"
      className="notification-popover"
      title="Notifications"
    >
      <NotificationsLatest />
    </Popover>
  );

  return (
    <nav>
      <NavItem>
        <OverlayTrigger
          trigger="click"
          rootClose
          placement="bottom"
          containerPadding={15}
          overlay={popoverNotification}
        >
          <ActionButton>
            <Icon icon="android-notifications" />
            <Badge>{unreadCount !== 0 ? unreadCount : null}</Badge>
          </ActionButton>
        </OverlayTrigger>
      </NavItem>
      <NavItem>
        <Dropdown id="dropdown-user" pullRight>
          <DropdownToggle bsRole="toggle">
            <UserHelper>
              <UserInfo>
                <span>{currentUser.details.fullName}</span>
                <NameCard.Avatar user={currentUser} size={30} />
                <Icon icon="chevron-down" />
              </UserInfo>
            </UserHelper>
          </DropdownToggle>
          <Dropdown.Menu>
            <NameCardWrapper>
              <NameCard user={currentUser} />
            </NameCardWrapper>
            <MenuItem divider />
            <li>
              <Link to="/settings/profile">Edit Profile</Link>
            </li>
            <li>
              <Link to="/change-password">Change password</Link>
            </li>
            <MenuItem divider />
            <MenuItem onClick={logout}>Sign out</MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </NavItem>
    </nav>
  );
};

QuickNavigation.propTypes = {
  logout: PropTypes.func,
  currentUser: PropTypes.object.isRequired
};

export default QuickNavigation;
