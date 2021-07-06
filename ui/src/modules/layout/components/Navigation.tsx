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
  ExpandIcon
} from '../styles';
import Tip from 'modules/common/components/Tip';
import Icon from 'modules/common/components/Icon';

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
            {collapsed && <label>{__(text)}</label>}
            {label}
          </NavLink>
          {childrens && (
            <SubNav collapsed={collapsed}>
              {!collapsed && <SubNavTitle>{__(text)}</SubNavTitle>}
              {childrens.map((child, index) => (
                <SubNavItem key={index} additional={child.additional || false}>
                  <NavLink to={child.link}>
                    <i className={child.icon} />
                    {__(child.value)}
                  </NavLink>
                </SubNavItem>
              ))}
            </SubNav>
          )}
        </NavItem>
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
                key: 'showConversations',
                link: '/inbox',
                value: 'Conversations',
                icon: 'icon-chat'
              },
              {
                key: 'showChannels',
                link: '/settings/channels',
                value: 'Channels',
                icon: 'icon-layer-group',
                additional: true
              },
              {
                key: 'showIntegrations',
                link: '/settings/integrations',
                value: 'Integrations',
                icon: 'icon-puzzle-piece'
              },
              {
                key: 'showSkills',
                link: '/settings/skills',
                value: 'Skills',
                icon: 'icon-file-info-alt'
              },
              {
                key: 'showResponses',
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
                key: 'showVisitors',
                link: '/contacts/visitor',
                value: 'Visitors',
                icon: 'icon-user-square'
              },
              {
                key: 'showLeads',
                link: '/contacts/lead',
                value: 'Leads',
                icon: 'icon-file-alt'
              },
              {
                key: 'showCustomers',
                link: '/contacts/customer',
                value: 'Customers',
                icon: 'icon-users-alt'
              },
              {
                key: 'showCompanies',
                link: '/companies',
                value: 'Companies',
                icon: 'icon-building'
              },
              {
                key: 'showSegments',
                link: '/segments/customer',
                value: 'Segments',
                icon: 'icon-chart-pie-alt',
                additional: true
              },
              {
                key: 'showTags',
                link: '/tags/conversation',
                value: 'Tags',
                icon: 'icon-tag-alt'
              }
            ]
          )}
          {this.renderNavItem(
            'showMarketing',
            __('Marketing'),
            '/forms',
            'icon-head-1',
            [
              {
                key: 'showForms',
                link: '/forms',
                value: 'Forms',
                icon: 'icon-laptop'
              },
              {
                key: 'showEngagesMessages',
                link: '/campaigns',
                value: 'Campaigns',
                icon: 'icon-megaphone'
              },
              {
                key: 'showGrowthHacks',
                link: '/growthHack',
                value: 'Growth hacking',
                icon: 'icon-idea'
              }
            ]
          )}
          {this.renderNavItem(
            'showSales',
            __('Sales'),
            '/deal',
            'icon-signal-alt-3',
            [
              {
                key: 'showSales',
                link: '/deal',
                value: 'Sales pipeline',
                icon: 'icon-piggy-bank'
              },
              {
                key: 'showProductService',
                link: '/settings/product-service',
                value: 'Products & service',
                icon: 'icon-box'
              }
            ]
          )}
          {this.renderNavItem(
            'showSupport',
            __('Support'),
            '/knowledgeBase',
            'icon-circular',
            [
              {
                key: 'showTickets',
                link: '/inbox/ticket/board',
                value: 'Tickets',
                icon: 'icon-ticket'
              },
              {
                key: 'showKnowledgeBase',
                link: '/knowledgeBase',
                value: 'Knowledgebase',
                icon: 'icon-book-open'
              },
              {
                key: 'showForum',
                link: '/forum',
                value: 'Forum',
                icon: 'icon-list-ui-alt'
              }
            ]
          )}
          {this.renderNavItem(
            'showManagement',
            __('Managament'),
            '/task',
            'icon-laptop',
            [
              {
                key: 'showTask',
                link: '/task',
                value: 'Task',
                icon: 'icon-file-check-alt'
              },
              REACT_APP_DASHBOARD_URL !== 'undefined' && {
                key: 'showDashboards',
                link: '/dashboard',
                value: 'Reports',
                icon: 'icon-dashboard'
              },
              {
                key: 'showCalendar',
                link: '/calendar',
                value: 'Calendar',
                icon: 'icon-calendar-alt'
              }
            ]
          )}

          {pluginsOfNavigations(this.renderNavItem)}
        </Nav>
      </LeftNavigation>
    );
  }
}

export default Navigation;
