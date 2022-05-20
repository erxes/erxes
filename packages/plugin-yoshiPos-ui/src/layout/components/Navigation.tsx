import { IUser } from '../../auth/types';
import WithPermission from '../../common/components/WithPermission';
import { __ } from '../../common/utils';
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LeftNavigation,
  NavIcon,
  SubNav,
  SubNavTitle,
  SubNavItem,
  DropSubNav,
  DropSubNavItem
} from '../styles';
import { IConfig } from '../../types';
import { POS_MODES } from '../../constants';

export interface ISubNav {
  permission: string;
  link: string;
  value: string;
  icon: string;
  additional?: boolean;
}

type IProps = {
  unreadConversationsCount?: number;
  collapsed: boolean;
  onCollapseNavigation: () => void;
  currentConfig?: IConfig;
  posCurrentUser: IUser;
  options: any;
};

class Navigation extends React.Component<IProps> {
  getLink = url => {
    const storageValue = window.localStorage.getItem('pagination:perPage');

    let parsedStorageValue;

    try {
      parsedStorageValue = JSON.parse(storageValue || '');
    } catch {
      parsedStorageValue = {};
    }

    if (url.includes('?')) {
      const pathname = url.split('?')[0];

      if (!url.includes('perPage') && parsedStorageValue[pathname]) {
        return `${url}&perPage=${parsedStorageValue[pathname]}`;
      }
      return url;
    }

    if (parsedStorageValue[url]) {
      return `${url}?perPage=${parsedStorageValue[url]}`;
    }

    return url;
  };

  renderSubNavItem = (child, index: number) => {
    return (
      <WithPermission key={index} action={child.permission}>
        <SubNavItem additional={child.additional || false}>
          <NavLink to={this.getLink(child.link)}>
            <i className={child.icon} />
            {__(child.value)}
          </NavLink>
        </SubNavItem>
      </WithPermission>
    );
  };

  renderChildren(
    collapsed: boolean,
    url: string,
    text: string,
    childrens?: ISubNav[]
  ) {
    if (!childrens || childrens.length === 0) {
      return null;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const parent = urlParams.get('parent');

    if (
      collapsed &&
      (parent === url || window.location.pathname.startsWith(url))
    ) {
      return (
        <DropSubNav>
          {childrens.map((child, index) => (
            <WithPermission key={index} action={child.permission}>
              <DropSubNavItem>
                <NavLink to={this.getLink(`${child.link}?parent=${url}`)}>
                  <i className={child.icon} />
                  {__(child.value)}
                </NavLink>
              </DropSubNavItem>
            </WithPermission>
          ))}
        </DropSubNav>
      );
    }

    return (
      <SubNav>
        <SubNavTitle>{__(text)}</SubNavTitle>
        {childrens.map((child, index) => this.renderSubNavItem(child, index))}
      </SubNav>
    );
  }

  renderSyncMenu() {
    const { posCurrentUser } = this.props;

    if (!posCurrentUser) {
      return '';
    }

    if (localStorage.getItem('erxesPosMode')) {
      return '';
    }

    return (
      <NavLink to="/settings">
        <NavIcon className={'icon-sync-exclamation'} />
      </NavLink>
    );
  }

  renderKitchenMenu() {
    const { posCurrentUser, currentConfig } = this.props;

    if (!posCurrentUser || !currentConfig) {
      return '';
    }

    if (!currentConfig.kitchenScreen) {
      return '';
    }

    if (
      ![POS_MODES.POS, POS_MODES.KITCHEN].includes(
        localStorage.getItem('erxesPosMode') || ''
      )
    ) {
      return '';
    }

    return (
      <NavLink to="/kitchen-screen">
        <NavIcon className={'icon-wallclock'} />
      </NavLink>
    );
  }

  renderWaitingMenu() {
    const { posCurrentUser, currentConfig } = this.props;

    if (!posCurrentUser || !currentConfig) {
      return '';
    }

    if (!currentConfig.waitingScreen) {
      return '';
    }

    if (
      ![POS_MODES.POS, POS_MODES.WAITING].includes(
        localStorage.getItem('erxesPosMode') || ''
      )
    ) {
      return '';
    }

    return (
      <NavLink to="/waiting-screen">
        <NavIcon className={'icon-presentation'} />
      </NavLink>
    );
  }

  render() {
    const { collapsed, options } = this.props;
    const logo = collapsed ? 'logo.png' : 'erxes.png';

    return (
      <LeftNavigation color={options.colors.primary}>
        <NavLink to="/">
          <img src={options.favIcon || `/images/${logo}`} alt="logo" />
        </NavLink>
        {this.renderSyncMenu()}
        {this.renderKitchenMenu()}
        {this.renderWaitingMenu()}
      </LeftNavigation>
    );
  }
}

export default Navigation;
