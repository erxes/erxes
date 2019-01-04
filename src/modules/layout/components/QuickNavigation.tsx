import { IUser } from 'modules/auth/types';
import {
  DropdownToggle,
  Icon,
  ModalTrigger,
  NameCard
} from 'modules/common/components';
import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import { Widget } from 'modules/notifications/containers';
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

  .dropdown-menu {
    min-width: 240px;
  }

  > a {
    color: ${colors.colorCoreDarkGray};
  }
`;

const QuickNavigation = ({
  logout,
  currentUser
}: {
  logout: () => void;
  currentUser: IUser;
}) => {
  const passContent = props => <ChangePassword {...props} />;
  const signatureContent = props => <Signature {...props} />;
  const notificationContent = props => (
    <NotificationSettings currentUser={currentUser} {...props} />
  );

  return (
    <nav>
      <NavItem>
        <Widget />
      </NavItem>
      <NavItem>
        <Link to="/settings">
          <Icon icon="settings" size={18} />
        </Link>
      </NavItem>
      <NavItem>
        <Dropdown id="dropdown-user" pullRight={true}>
          <DropdownToggle bsRole="toggle">
            <UserHelper>
              <UserInfo>
                <NameCard.Avatar user={currentUser} size={30} />
                <Icon icon="downarrow" size={10} />
              </UserInfo>
            </UserHelper>
          </DropdownToggle>
          <Dropdown.Menu>
            <NameCardWrapper>
              <NameCard user={currentUser} />
            </NameCardWrapper>
            <MenuItem divider={true} />

            <li>
              <Link to="/profile">{__('View Profile')}</Link>
            </li>

            <ModalTrigger
              title="Change Password"
              trigger={
                <li>
                  <a>{__('Change Password')}</a>
                </li>
              }
              content={passContent}
            />

            <ModalTrigger
              title="Email signatures"
              trigger={
                <li>
                  <a>{__('Email signatures')}</a>
                </li>
              }
              content={signatureContent}
            />

            <ModalTrigger
              title="Notification settings"
              trigger={
                <li>
                  <a>{__('Notification settings')}</a>
                </li>
              }
              content={notificationContent}
            />

            <MenuItem divider={true} />
            <MenuItem onClick={logout}>{__('Sign out')}</MenuItem>
          </Dropdown.Menu>
        </Dropdown>
      </NavItem>
    </nav>
  );
};

export default QuickNavigation;
