import WithPermission from 'modules/common/components/WithPermission';
import { __, setBadge, readFile } from 'modules/common/utils';
import { pluginNavigations, pluginsOfNavigations } from 'pluginUtils';
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LeftNavigation,
  NavIcon,
  Nav,
  SubNav,
  NavItem,
  SubNavItem,
  MoreMenuWrapper,
  MoreSearch,
  StoreItem,
  MoreItemRecent,
  MoreMenus,
  MoreTitle,
  NavMenuItem
} from '../styles';
import Tip from 'modules/common/components/Tip';
import { getThemeItem } from 'utils';
import Icon from 'modules/common/components/Icon';
import FormControl from 'modules/common/components/form/Control';

export interface ISubNav {
  permission: string;
  link: string;
  value: string;
  icon: string;
  additional?: boolean;
}

type IProps = {
  unreadConversationsCount?: number;
};

type State = {
  showMenu: boolean;
  moreMenus: any[];
  searchText: string;
};

class Navigation extends React.Component<IProps, State> {
  private wrapperRef: any;

  constructor(props) {
    super(props);

    this.state = {
      showMenu: false,
      moreMenus: pluginNavigations().slice(4) || [],
      searchText: ''
    };
  }

  setWrapperRef = (node) => {
    this.wrapperRef = node;
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  componentWillReceiveProps = (nextProps) => {
    const unreadCount = nextProps.unreadConversationsCount;

    if (unreadCount !== this.props.unreadConversationsCount) {
      setBadge(unreadCount, __('Team Inbox').toString());
    }
  }

  handleClickOutside = (event) => {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ showMenu: false });
    }
  }

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

  onSearch = (value: string) => {
    const filteredValue = val => val.text.toLowerCase().includes(value);

    this.setState({
      moreMenus: pluginNavigations().slice(4).filter(filteredValue),
    });
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

  renderChildren(url: string, text: string, childrens?: ISubNav[]) {
    if (!childrens || childrens.length === 0) {
      return null;
    }

    return (
      <SubNav>
        {childrens.map((child, index) => this.renderSubNavItem(child, index))}
      </SubNav>
    );
  }

  renderMenuItem(nav) {
    const { icon, text, url, label } = nav;

    return (
      <NavMenuItem>
        <NavLink to={this.getLink(url)}>
          <NavIcon className={icon} />
          <label>{__(text)}</label>
          {label}
        </NavLink>
      </NavMenuItem>
    );
  }

  renderNavItem = (
    permission: string,
    text: string,
    url: string,
    icon?: string,
    childrens?: ISubNav[],
    label?: React.ReactNode
  ) => {

    const item = (
      <NavItem>
        {this.renderMenuItem({icon, url, text, label})}
        {this.renderChildren(url, text, childrens)}
      </NavItem>
    );

    if (!childrens || childrens.length === 0) {
      return (
        <WithPermission key={url} action={permission}>
          <Tip placement="right" key={Math.random()} text={__(text)}>
            {item}
          </Tip>
        </WithPermission>
      );
    }

    return (
      <WithPermission key={url} action={permission}>
        {item}
      </WithPermission>
    );
  };

  renderMorePlugins = () => {
    const { showMenu, moreMenus } = this.state;

    return (
      <div ref={this.setWrapperRef}>
        <MoreMenuWrapper visible={showMenu}>
          <MoreSearch>
            <Icon icon="search-1" size={15} />
            <FormControl
              onChange={(e: any) =>
                this.onSearch(e.target.value.trim().toLowerCase())
              }
              type="text"
              placeholder="Find plugins"
            />
          </MoreSearch>
          <MoreTitle>{__('Other added plugins')}</MoreTitle>
          <MoreMenus>
            {moreMenus.map((menu, index) => (
              <MoreItemRecent key={index}>
                {this.renderMenuItem(menu)}
              </MoreItemRecent>
            ))}
          </MoreMenus>
        </MoreMenuWrapper>
      </div>
    );
  };

  renderMore() {
    const { showMenu } = this.state;

    if(pluginNavigations().length <= 4 ) {
      return null;
    }

    return (
      <NavItem>
        <NavMenuItem>
          <a onClick={() => this.setState({ showMenu: !showMenu })}>
            <NavIcon className="icon-ellipsis-h" />
            <label>{__('More')}</label>
          </a>
        </NavMenuItem>

        {this.renderMorePlugins()}
      </NavItem>
    );
  }

  render() {
    const Navs = pluginNavigations().slice(0, 4);
    const logo = 'logo-dark.png';
    const thLogo = getThemeItem('logo');

    return (
      <LeftNavigation>
        <NavLink to="/">
          <img
            src={thLogo ? readFile(thLogo) : `/images/${logo}`}
            alt="erxes"
          />
        </NavLink>

        <Nav id="navigation">
          {Navs.map(nav => 
            this.renderMenuItem(nav)   
          )}

          {pluginsOfNavigations(this.renderNavItem)}

          {this.renderMenuItem({
            text: 'Settings',
            url: '/settings',
            icon: 'icon-settings'
          })}

          {this.renderMore()}

          <StoreItem>
            {this.renderMenuItem({
              text: 'Store',
              url: '/store',
              icon: 'icon-store'
            })}
          </StoreItem>
        </Nav>
      </LeftNavigation>
    );
  }
}

export default Navigation;
