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
  Collapse,
  SubNav,
  NavItem,
  SubNavTitle
} from '../styles';

const { REACT_APP_DASHBOARD_URL } = getEnv();

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

  renderNavItem = (
    permission: string,
    text: string,
    url: string,
    icon: string,
    childrens?: any,
    label?: React.ReactNode
  ) => {
    const { collapsed } = this.props;

    return (
      <WithPermission key={url} action={permission}>
        {collapsed ? (
          <NavItem>
            <NavLink to={url}>
              <NavIcon className={icon} />
              {__(text)}
            </NavLink>
            {childrens && (
              <SubNav collapsed={collapsed}>
                {childrens.map((child, index) => (
                  <li key={index}>
                    <NavLink to={child.link}>{child.value}</NavLink>
                  </li>
                ))}
              </SubNav>
            )}
          </NavItem>
        ) : (
          <NavItem>
            <NavLink to={url}>
              <NavIcon className={icon} />
              {label}
            </NavLink>
            {childrens && (
              <SubNav collapsed={collapsed}>
                <SubNavTitle>{__(text)}</SubNavTitle>
                {childrens.map((child, index) => (
                  <li key={index}>
                    <NavLink to={child.link}>{child.value}</NavLink>
                  </li>
                ))}
              </SubNav>
            )}
          </NavItem>
        )}
      </WithPermission>
    );
  };

  renderCollapse() {
    const { onCollapseNavigation, collapsed } = this.props;
    const icon = collapsed ? 'icon-sign-in-alt' : 'icon-sign-out-alt';

    return (
      <Collapse onClick={onCollapseNavigation} collapsed={collapsed}>
        <NavIcon className={icon} />
        {collapsed && __('Collapse menu')}
      </Collapse>
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

    return (
      <LeftNavigation collapsed={collapsed}>
        <NavLink to="/">
          <img src={`/images/${logo}`} alt="erxes" />
        </NavLink>
        <Nav id="navigation" collapsed={collapsed}>
          {REACT_APP_DASHBOARD_URL !== 'undefined' &&
            this.renderNavItem(
              'showDashboards',
              __('Dashboard'),
              '/dashboard',
              'icon-dashboard'
            )}
          {this.renderNavItem(
            'showConversations',
            __('Team Inbox'),
            '/inbox',
            'icon-chat',
            [
              { key: 'channels', link: __('Conversation'), value: 'Channels' },
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Integrations'
              },
              { key: 'channels', link: __('Conversation'), value: 'Skills' },
              { key: 'channels', link: __('Conversation'), value: 'Responses' }
            ],
            unreadIndicator
          )}
          {this.renderNavItem(
            'showCustomers',
            __('Contacts'),
            '/contacts',
            'icon-users',
            [
              { key: 'channels', link: __('Conversation'), value: 'Visitors' },
              { key: 'channels', link: __('Conversation'), value: 'Leads' },
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Customers'
              },
              { key: 'channels', link: __('Conversation'), value: 'Companies' },
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Segments',
                additional: true
              },
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Tags',
                additional: true
              }
            ]
          )}
          {this.renderNavItem(
            'showForms',
            __('Marketing'),
            '/forms',
            'icon-megaphone',
            [
              { key: 'channels', link: __('Conversation'), value: 'Forms' },
              { key: 'channels', link: __('Conversation'), value: 'Campaigns' },
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Growth hacking'
              }
            ]
          )}
          {this.renderNavItem(
            'showForms',
            __('Sales'),
            '/forms',
            'icon-laptop',
            [
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Sales pipeline'
              },
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Products & service'
              }
            ]
          )}
          {this.renderNavItem(
            'showForms',
            __('Support'),
            '/forms',
            'icon-idea',
            [
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Tickets'
              },
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Knowledgebase'
              },
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Forum'
              }
            ]
          )}
          {this.renderNavItem(
            'showEngagesMessages',
            __('Managament'),
            '/campaigns',
            'icon-piggy-bank',
            [
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Task'
              },
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Reports'
              },
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Calendar (Coming soon)'
              },
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Scheduler (Coming soon)'
              }
            ]
          )}
          {this.renderNavItem(
            'showEngagesMessages',
            __('Quick access'),
            '/campaigns',
            'icon-link-broken',
            [
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Create a new email'
              },
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Create a new task'
              },
              {
                key: 'channels',
                link: __('Conversation'),
                value: 'Create a new deal'
              }
            ]
          )}

          {this.renderCollapse()}

          {pluginsOfNavigations(this.renderNavItem)}
        </Nav>
      </LeftNavigation>
    );
  }
}

export default Navigation;
