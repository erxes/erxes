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
        <NavItem>
          <NavLink to={url}>
            <NavIcon className={icon} />
            {collapsed ? __(text) : label}
          </NavLink>
          {childrens && (
            <SubNav collapsed={collapsed}>
              {!collapsed && <SubNavTitle>{__(text)}</SubNavTitle>}
              {childrens.map((child, index) => (
                <li key={index}>
                  <NavLink to={child.link}>{__(child.value)}</NavLink>
                </li>
              ))}
            </SubNav>
          )}
        </NavItem>
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
          {this.renderNavItem(
            'showConversations',
            __('Team Inbox'),
            '/inbox',
            'icon-chat',
            [
              {
                key: 'showConversations',
                link: '/inbox',
                value: 'Conversations'
              },
              {
                key: 'showChannels',
                link: '/settings/channels',
                value: 'Channels'
              },
              {
                key: 'showIntegrations',
                link: '/settings/integrations',
                value: 'Integrations'
              },
              { key: 'showSkills', link: '/settings/skills', value: 'Skills' },
              {
                key: 'showResponses',
                link: '/settings/response-templates',
                value: 'Responses'
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
                key: 'showVisitors',
                link: '/contacts/visitor',
                value: 'Visitors'
              },
              { key: 'showLeads', link: '/contacts/lead', value: 'Leads' },
              {
                key: 'showCustomers',
                link: '/contacts/customer',
                value: 'Customers'
              },
              { key: 'showCompanies', link: '/companies', value: 'Companies' },
              {
                key: 'showSegments',
                link: '/segments/customer',
                value: 'Segments',
                additional: true
              },
              {
                key: 'showTags',
                link: '/tags/conversation',
                value: 'Tags',
                additional: true
              }
            ]
          )}
          {this.renderNavItem(
            'showMarketing',
            __('Marketing'),
            '/forms',
            'icon-megaphone',
            [
              { key: 'showForms', link: '/forms', value: 'Forms' },
              {
                key: 'showEngagesMessages',
                link: '/campaigns',
                value: 'Campaigns'
              },
              {
                key: 'showGrowthHacks',
                link: '/growthHack',
                value: 'Growth hacking'
              }
            ]
          )}
          {this.renderNavItem(
            'showSales',
            __('Sales'),
            '/deal',
            'icon-laptop',
            [
              {
                key: 'showSales',
                link: '/deal',
                value: 'Sales pipeline'
              },
              {
                key: 'showProductService',
                link: '/settings/product-service',
                value: 'Products & service'
              }
            ]
          )}
          {this.renderNavItem(
            'showSupport',
            __('Support'),
            '/inbox/ticket/board',
            'icon-idea',
            [
              {
                key: 'showTickets',
                link: '/inbox/ticket/board',
                value: 'Tickets'
              },
              {
                key: 'showKnowledgeBase',
                link: '/knowledgeBase',
                value: 'Knowledgebase'
              },
              {
                key: 'showForum',
                link: '/forum',
                value: 'Forum'
              }
            ]
          )}
          {this.renderNavItem(
            'showManagement',
            __('Managament'),
            '/task',
            'icon-piggy-bank',
            [
              {
                key: 'showTask',
                link: '/task',
                value: 'Task'
              },
              REACT_APP_DASHBOARD_URL !== 'undefined' && {
                key: 'showDashboards',
                link: '/dashboard',
                value: 'Reports'
              },
              {
                key: 'showCalendar',
                link: '/calendar',
                value: 'Calendar'
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
