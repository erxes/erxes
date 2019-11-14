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
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { UserHelper } from '../styles';
import BrandChooser from './BrandChooser';

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

const QuickNavigation = ({
  logout,
  currentUser,
  showBrands,
  selectedBrands,
  onChangeBrands
}: {
  logout: () => void;
  currentUser: IUser;
  showBrands: boolean;
  selectedBrands: string[];
  onChangeBrands: (value: string) => void;
}) => {
  const passContent = props => <ChangePassword {...props} />;
  const signatureContent = props => <Signature {...props} />;

  const notificationContent = props => (
    <NotificationSettings currentUser={currentUser} {...props} />
  );

  const brands = currentUser.brands || [];

  const brandOptions = brands.map(brand => ({
    value: brand._id,
    label: brand.name || ''
  }));

  let brandsCombo;

  if (showBrands && brands.length > 1) {
    brandsCombo = (
      <NavItem>
        <BrandChooser
          selectedItems={selectedBrands}
          items={brandOptions}
          onChange={onChangeBrands}
        />
      </NavItem>
    );
  }

  return (
    <nav>
      {brandsCombo}

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
        <Dropdown alignRight={true}>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-user">
            <UserHelper>
              <UserInfo>
                <NameCard.Avatar user={currentUser} size={30} />
                <Icon icon="angle-down" />
              </UserInfo>
            </UserHelper>
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <NameCardWrapper>
              <NameCard user={currentUser} />
            </NameCardWrapper>
            <Dropdown.Divider />

            <li>
              <Link to="/profile">{__('View Profile')}</Link>
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

            <Dropdown.Divider />
            <Dropdown.Item onClick={logout}>{__('Sign out')}</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </NavItem>
    </nav>
  );
};

export default QuickNavigation;
