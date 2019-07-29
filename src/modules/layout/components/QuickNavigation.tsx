import { IUser } from 'modules/auth/types';
import asyncComponent from 'modules/common/components/AsyncComponent';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tip from 'modules/common/components/Tip';
import { colors } from 'modules/common/styles';
import { __ } from 'modules/common/utils';
import Widget from 'modules/notifications/containers/Widget';
import NotificationSettings from 'modules/settings/profile/containers/NotificationSettings';
import React from 'react';
import { Dropdown, MenuItem } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { UserHelper } from '../styles';

const Signature = asyncComponent(() =>
  import(/* webpackChunkName:"Signature" */ 'modules/settings/email/containers/Signature')
);

const ChangePassword = asyncComponent(() =>
  import(/* webpackChunkName:"ChangePassword" */ 'modules/settings/profile/containers/ChangePassword')
);

const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    float: none;
    margin: 0 5px 0 10px;
  }
`;

const NameCardWrapper = styled.div`
  padding: 10px 20px;
`;

const NavItem = styledTS<{ odd?: boolean }>(styled.div)`
  padding-left: 20px;
  padding-right: ${props => props.odd && '20px'};
  display: table-cell;
  vertical-align: middle;

  ${props =>
    props.odd &&
    css`
      padding-right: 20px;
      background: ${colors.bgLight};
    `}

  .dropdown-menu {
    min-width: 240px;
  }

  > a {
    color: ${colors.colorCoreDarkGray};
  }
`;

const WorkFlowImage = styled.img`
  width: 100%;
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
  const workflowContent = props => (
    <WorkFlowImage
      alt="workflow-diagram"
      src="/images/workflow-diagram.svg"
      {...props}
    />
  );
  const notificationContent = props => (
    <NotificationSettings currentUser={currentUser} {...props} />
  );

  return (
    <nav>
      <Tip text={__('Task')} placement="bottom">
        <NavItem odd={true}>
          <Link to="/task">
            <Icon icon="clipboard" size={16} />
          </Link>
        </NavItem>
      </Tip>

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
                <Icon icon="angle-down" />
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

            <li>
              <Link to="/getting-started">{__('Initial setup')}</Link>
            </li>

            <ModalTrigger
              title="Change Password"
              trigger={
                <li>
                  <a href="#change-password">{__('Change Password')}</a>
                </li>
              }
              content={passContent}
            />

            <ModalTrigger
              title="Email signatures"
              trigger={
                <li>
                  <a href="#email">{__('Email signatures')}</a>
                </li>
              }
              content={signatureContent}
            />

            <ModalTrigger
              title="Notification settings"
              trigger={
                <li>
                  <a href="#notif">{__('Notification settings')}</a>
                </li>
              }
              content={notificationContent}
            />

            <MenuItem divider={true} />
            <ModalTrigger
              title="Workflow: Brand > Integration > Channel > Team member > Team Inbox"
              dialogClassName="middle"
              trigger={
                <li>
                  <a href="#flow">{__('Workflow')}</a>
                </li>
              }
              content={workflowContent}
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
