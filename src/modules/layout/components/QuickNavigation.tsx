import { IUser } from 'modules/auth/types';
import {
  DropdownToggle,
  Icon,
  ModalTrigger,
  NameCard
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Signature } from 'modules/settings/email/containers';
import {
  ChangePassword,
  NotificationSettings
} from 'modules/settings/profile/containers';
import * as React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { UserHelper } from '../styles';

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

const QuickNavigation = ({ logout, currentUser }: { logout: () => void, currentUser: IUser }, context) => {
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
              <NotificationSettings currentUser={currentUser} />
            </ModalTrigger>

            <MenuItem divider />
            <MenuItem onClick={logout}>{__('Sign out')}</MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </NavItem>
    </nav>
  );
};

export default QuickNavigation;
