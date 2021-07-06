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
                <WithPermission key={index} action={child.permission}>
                  <SubNavItem additional={child.additional || false}>
                    <NavLink to={child.link}>
                      <i className={child.icon} />
                      {__(child.value)}
                    </NavLink>
                  </SubNavItem>
                </WithPermission>
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
                permission: 'showConversations',
                link: '/inbox',
                value: 'Conversations',
                icon: 'icon-chat'
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
                value: 'Growth hacking',
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
                value: 'Sales pipeline',
                icon: 'icon-piggy-bank'
              },
              {
                permission: 'showProducts',
                link: '/settings/product-service',
                value: 'Products & service',
                icon: 'icon-box'
              }
            ]
          )}
          {this.renderNavItem(
            'showKnowledgeBase',
            __('Support'),
            '/knowledgeBase',
            'icon-circular',
            [
              {
                permission: 'showTickets',
                link: '/inbox/ticket/board',
                value: 'Tickets',
                icon: 'icon-ticket'
              },
              {
                permission: 'showKnowledgeBase',
                link: '/knowledgeBase',
                value: 'Knowledgebase',
                icon: 'icon-book-open'
              },
              {
                permission: 'showForum',
                link: '/forum',
                value: 'Forum',
                icon: 'icon-list-ui-alt'
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
              REACT_APP_DASHBOARD_URL !== 'undefined' && {
                permission: 'showDashboards',
                link: '/dashboard',
                value: 'Reports',
                icon: 'icon-dashboard'
              },
              {
                permission: 'showCalendars',
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
