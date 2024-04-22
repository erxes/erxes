import { DropNav, UserHelper } from '../styles';
import { __, getEnv } from 'modules/common/utils';
import { colors, dimensions } from 'modules/common/styles';

import BrandChooser from './BrandChooser';
import { IUser } from 'modules/auth/types';
import Icon from 'modules/common/components/Icon';
import { Link } from 'react-router-dom';
import { Menu } from '@headlessui/react';
import { MenuDivider } from '@erxes/ui/src/styles/main';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Organizations from 'modules/saas/navigation/Organizations';
import React from 'react';
import Search from '../containers/Search';
import { SubMenu } from 'modules/saas/navigation/styles';
import Usage from 'modules/saas/settings/plans/components/Usage';
import asyncComponent from 'modules/common/components/AsyncComponent';
import { getVersion } from '@erxes/ui/src/utils/core';
import { pluginsOfTopNavigations } from 'pluginUtils';
import styled from 'styled-components';

const Signature = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"Signature" */ '@erxes/ui-settings/src/email/containers/Signature'
    ),
);

const ChangePassword = asyncComponent(
  () =>
    import(
      /* webpackChunkName:"ChangePassword" */ 'modules/settings/profile/containers/ChangePassword'
    ),
);

const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    float: none;
    margin: 0 5px 0 0;
  }

  i {
    width: 10px;
  }
`;

const NameCardWrapper = styled.div`
  padding: 10px 20px 0;
`;

export const NavItem = styled.div`
  padding-left: 18px;
  display: table-cell;
  vertical-align: middle;

  > a {
    color: ${colors.textSecondary};
    display: flex;
    align-items: center;

    &:hover {
      color: ${colors.colorSecondary};
    }
  }

  .dropdown-menu {
    min-width: 240px;
  }
`;

const Version = styled.div`
  padding: 0 ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px;
  float: right;

  span {
    background: #f2f2f2;
    padding: 3px 10px;
    border-radius: 12px;
    text-transform: uppercase;
    font-size: 9px;
    color: ${colors.colorCoreGray};
    border: 1px solid ${colors.borderPrimary};
  }
`;

const QuickNavigation = ({
  logout,
  currentUser,
  showBrands,
  selectedBrands,
  onChangeBrands,
  release,
}: {
  logout: () => void;
  currentUser: IUser;
  showBrands: boolean;
  selectedBrands: string[];
  onChangeBrands: (value: string) => void;
  release: string;
}) => {
  const passContent = (props) => <ChangePassword {...props} />;
  const signatureContent = (props) => <Signature {...props} />;

  const brands = currentUser.brands || [];

  const brandOptions = brands.map((brand) => ({
    value: brand._id,
    label: brand.name || '',
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

  const { CORE_URL } = getEnv();
  const { VERSION } = getVersion();

  return (
    <nav id={'SettingsNav'}>
      {brandsCombo}

      <NavItem>
        <Search />
      </NavItem>
      {pluginsOfTopNavigations()}
      <NavItem>
        <Menu as="div" className="relative">
          <Menu.Button>
            <UserHelper>
              <UserInfo>
                <NameCard.Avatar user={currentUser} size={30} />
                <Icon icon="angle-down" size={14} />
              </UserInfo>
            </UserHelper>
          </Menu.Button>
          <Menu.Items className="absolute">
            <NameCardWrapper>
              <NameCard user={currentUser} />
            </NameCardWrapper>
            <MenuDivider />
            <Menu.Item>
              <Link to="/profile">{__('My Profile')}</Link>
            </Menu.Item>
            <Menu.Item>
              <DropNav>
                {__('Account Settings')}
                <Icon icon="angle-right" />
                <ul>
                  <ModalTrigger
                    title="Change Password"
                    trigger={
                      <li>
                        <a href="#change-password">{__('Change password')}</a>
                      </li>
                    }
                    content={passContent}
                  />

                  <ModalTrigger
                    title="Email signatures"
                    enforceFocus={false}
                    trigger={
                      <li>
                        <a href="#email">{__('Email signatures')}</a>
                      </li>
                    }
                    content={signatureContent}
                  />
                </ul>
              </DropNav>
            </Menu.Item>
            <MenuDivider />
            {VERSION &&
            VERSION === 'saas' &&
            currentUser.currentOrganization ? (
              <>
                <Menu.Item>
                  <DropNav>
                    {__('Global Profile')} <Icon icon="angle-right" />
                    <ul>
                      <li>
                        <a href={`${CORE_URL}/organizations`}>
                          {__('Go to Global Profile')}
                        </a>
                      </li>
                      <li>
                        <a href={`${CORE_URL}/billing`}>
                          {__('Go to Billing')}
                        </a>
                      </li>
                    </ul>
                  </DropNav>
                </Menu.Item>

                <MenuDivider />
                <SubMenu>
                  <Menu.Item>
                    <Organizations
                      organizations={currentUser.organizations || []}
                    />
                  </Menu.Item>
                </SubMenu>
                <Usage />
              </>
            ) : null}
            <Menu.Item>
              <a onClick={logout}>{__('Sign out')}</a>
            </Menu.Item>
            {release ? (
              <Version>
                <span>
                  version <b>{release}</b>
                </span>
              </Version>
            ) : null}
          </Menu.Items>
        </Menu>
      </NavItem>
    </nav>
  );
};

export default QuickNavigation;
