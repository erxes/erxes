import * as React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Dropdown, MenuItem } from 'react-bootstrap';
import styled from 'styled-components';
import {
  NameCard,
  DropdownToggle,
  Icon,
  ModalTrigger
} from 'modules/common/components';
import { UserHelper } from '../styles';
import {
  ChangePassword,
  NotificationSettings
} from 'modules/settings/profile/containers';
import { Signature } from 'modules/settings/email/containers';

const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    float: none;
    margin: 0 10px;
  }
`;

const NameCardWrapper = styled.div`
  padding: 10px 20px;
`;

const NavItem = styled.div`
  padding-left: 20px;
  display: table-cell;
  vertical-align: middle;
`;

const QuickNavigation = ({ logout }, context) => {
  const { currentUser, __ } = context;

  return (
    <nav>
      <NavItem>
        <Dropdown id="dropdown-user" pullRight>
          <DropdownToggle bsRole="toggle">
            <UserHelper>
              <UserInfo>
                {currentUser.details.fullName}
                <NameCard.Avatar user={currentUser} size={30} />
                <Icon icon="downarrow" size={10} />
              </UserInfo>
            </UserHelper>
          </DropdownToggle>
          <Dropdown.Menu>
            <NameCardWrapper>
              <NameCard user={currentUser} />
            </NameCardWrapper>
            <MenuItem divider />

            <li>
              <Link to={`/settings/team/details/${currentUser._id}`}>
                {__('View Profile')}
              </Link>
            </li>

            <ModalTrigger
              title="Change Password"
              trigger={
                <li>
                  <a>{__('Change Password')}</a>
                </li>
              }
            >
              <ChangePassword />
            </ModalTrigger>

            <ModalTrigger
              title="Email signatures"
              trigger={
                <li>
                  <a>{__('Email signatures')}</a>
                </li>
              }
            >
              <Signature />
            </ModalTrigger>

            <ModalTrigger
              title="Notification settings"
              trigger={
                <li>
                  <a>{__('Notification settings')}</a>
                </li>
              }
            >
              <NotificationSettings />
            </ModalTrigger>

            <MenuItem divider />
            <MenuItem onClick={logout}>{__('Sign out')}</MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </NavItem>
    </nav>
  );
};

QuickNavigation.propTypes = {
  logout: PropTypes.func
};

QuickNavigation.contextTypes = {
  currentUser: PropTypes.object,
  __: PropTypes.func
};

export default QuickNavigation;
