import Label from 'modules/common/components/Label';
import WithPermission from 'modules/common/components/WithPermission';
import { __, getEnv, setBadge } from 'modules/common/utils';
import { pluginsOfNavigations } from 'pluginUtils';
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LeftNavigation,
  NavIcon,
  Nav,
  SubNav,
  NavItem,
  SubNavTitle,
  SubNavItem,
  DropSubNav,
  DropSubNavItem,
  ExpandIcon,
  SmallLabel
} from '../styles';
import Tip from 'modules/common/components/Tip';
import Icon from 'modules/common/components/Icon';

const { REACT_APP_DASHBOARD_URL } = getEnv();

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
};

class Navigation extends React.Component<IProps> {
  componentWillReceiveProps(nextProps) {
    const unreadCount = nextProps.unreadConversationsCount;

    if (unreadCount !== this.props.unreadConversationsCount) {
      setBadge(unreadCount, __('Team Inbox').toString());
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
      <SubNav collapsed={collapsed}>
        {!collapsed && <SubNavTitle>{__(text)}</SubNavTitle>}
        {childrens.map((child, index) => this.renderSubNavItem(child, index))}
      </SubNav>
    );
  }

  renderNavItem = (
    permission: string,
    text: string,
    url: string,
    icon: string,
    childrens?: ISubNav[],
    label?: React.ReactNode
  ) => {
    const { collapsed } = this.props;

    const item = (
      <NavItem>
        <NavLink to={this.getLink(url)}>
          <NavIcon className={icon} />
          {collapsed && <label>{__(text)}</label>}
          {label}
        </NavLink>
        {this.renderChildren(collapsed, url, text, childrens)}
      </NavItem>
    );

    if (!childrens || childrens.length === 0) {
      if (!collapsed) {
        return (
          <WithPermission key={url} action={permission}>
            <Tip placement="right" key={Math.random()} text={__(text)}>
              {item}
            </Tip>
          </WithPermission>
        );
      }
    }

    return (
      <WithPermission key={url} action={permission}>
        {item}
      </WithPermission>
    );
  };

  renderCollapse() {
    const { onCollapseNavigation, collapsed } = this.props;
    const icon = collapsed ? 'angle-double-left' : 'angle-double-right';
    const tooltipText = collapsed ? 'Collapse menu' : 'Expand menu';

    return (
      <Tip placement="right" text={__(tooltipText)}>
        <ExpandIcon onClick={onCollapseNavigation} collapsed={collapsed}>
          <Icon icon={icon} size={22} />
        </ExpandIcon>
      </Tip>
    );
  }

  render() {
    const { unreadConversationsCount, collapsed } = this.props;

    const logo = collapsed ? 'logo.png' : 'erxes.png';

    const unreadIndicator = unreadConversationsCount !== 0 && (
      <Label shake={true} lblStyle="danger" ignoreTrans={true}>
        {unreadConversationsCount}
      </Label>
    );

    const lbl = <SmallLabel>Beta</SmallLabel>;

    return (
      <LeftNavigation collapsed={collapsed}>
        <NavLink to="/">
          <img src={`/images/${logo}`} alt="erxes" />
        </NavLink>
        {this.renderCollapse()}
        <Nav id="navigation" collapsed={collapsed}>
          {this.renderNavItem(
            'showConversations',
            __('Team Inbox'),
            '/inbox',
            'icon-chat',
            [
              {
                permission: 'showConversations',
                link: '/inbox',
                value: 'Conversations',
                icon: 'icon-comments'
              },
              {
                permission: 'showChannels',
                link: '/settings/channels',
                value: 'Channels',
                icon: 'icon-layer-group',
                additional: true
              },
              {
                permission: 'showIntegrations',
                link: '/settings/integrations',
                value: 'Integrations',
                icon: 'icon-puzzle-piece'
              },
              {
                permission: 'getSkills',
                link: '/settings/skills',
                value: 'Skills',
                icon: 'icon-file-info-alt'
              },
              {
                permission: 'showResponseTemplates',
                link: '/settings/response-templates',
                value: 'Responses',
                icon: 'icon-files-landscapes'
              }
            ],
            unreadIndicator
          )}
          {this.renderNavItem(
            'showCustomers',
            __('Contacts'),
            '/contacts/customer',
            'icon-users',
            [
              {
                permission: 'showCustomers',
                link: '/contacts/visitor',
                value: 'Visitors',
                icon: 'icon-user-square'
              },
              {
                permission: 'showCustomers',
                link: '/contacts/lead',
                value: 'Leads',
                icon: 'icon-file-alt'
              },
              {
                permission: 'showCustomers',
                link: '/contacts/customer',
                value: 'Customers',
                icon: 'icon-users-alt'
              },
              {
                permission: 'showCompanies',
                link: '/companies',
                value: 'Companies',
                icon: 'icon-building'
              },
              {
                permission: 'showSegments',
                link: '/segments/customer',
                value: 'Segments',
                icon: 'icon-chart-pie-alt',
                additional: true
              },
              {
                permission: 'showTags',
                link: '/tags/conversation',
                value: 'Tags',
                icon: 'icon-tag-alt'
              }
            ]
          )}
          {this.renderNavItem(
            'showForms',
            __('Marketing'),
            '/forms',
            'icon-head-1',
            [
              {
                permission: 'showForms',
                link: '/forms',
                value: 'Forms',
                icon: 'icon-laptop'
              },
              {
                permission: 'showEngagesMessages',
                link: '/campaigns',
                value: 'Campaigns',
                icon: 'icon-megaphone'
              },
              {
                permission: 'showGrowthHacks',
                link: '/growthHack',
                value: 'Growth Hacking',
                icon: 'icon-idea'
              }
            ]
          )}
          {this.renderNavItem(
            'showDeals',
            __('Sales'),
            '/deal',
            'icon-signal-alt-3',
            [
              {
                permission: 'showDeals',
                link: '/deal',
                value: 'Sales Pipeline',
                icon: 'icon-piggy-bank'
              },
              {
                permission: 'showProducts',
                link: '/settings/product-service',
                value: 'Products & Service',
                icon: 'icon-box'
              },
              {
                permission: 'showIntegrations',
                link: '/bookings',
                value: 'Bookings',
                icon: 'icon-home'
              }
            ]
          )}
          {this.renderNavItem(
            'showKnowledgeBase',
            __('Support'),
            '/knowledgeBase',
            'icon-leaf',
            [
              {
                permission: 'showTickets',
                link: '/ticket/board',
                value: 'Tickets',
                icon: 'icon-ticket'
              },
              {
                permission: 'showKnowledgeBase',
                link: '/knowledgeBase',
                value: 'Knowledgebase',
                icon: 'icon-book-open'
              }
            ]
          )}
          {this.renderNavItem(
            'showConversations',
            __('Managament'),
            '/task',
            'icon-laptop',
            [
              {
                permission: 'showConversations',
                link: '/task',
                value: 'Task',
                icon: 'icon-file-check-alt'
              },
              REACT_APP_DASHBOARD_URL !== 'undefined'
                ? {
                    permission: 'showDashboards',
                    link: '/dashboard',
                    value: 'Reports',
                    icon: 'icon-dashboard'
                  }
                : ({} as ISubNav),
              {
                permission: 'showCalendars',
                link: '/calendar',
                value: 'Calendar',
                icon: 'icon-calendar-alt'
              }
            ]
          )}
          {this.renderNavItem(
            'showAutomations',
            __('Automations'),
            '/automations',
            'icon-circular',
            [],
            lbl
          )}

          {pluginsOfNavigations(this.renderNavItem)}
        </Nav>
      </LeftNavigation>
    );
  }
}

export default Navigation;
