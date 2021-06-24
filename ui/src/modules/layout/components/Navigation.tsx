import Label from 'modules/common/components/Label';
import Tip from 'modules/common/components/Tip';
import WithPermission from 'modules/common/components/WithPermission';
import { __, getEnv, setBadge } from 'modules/common/utils';
import { pluginsOfNavigations } from 'pluginUtils';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LeftNavigation, NavIcon, Nav, Collapse } from '../styles';

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
    label?: React.ReactNode
  ) => {
    const { collapsed } = this.props;

    return (
      <WithPermission key={url} action={permission}>
        {collapsed ? (
          <NavLink to={url}>
            <NavIcon className={icon} />
            {__(text)}
          </NavLink>
        ) : (
          <Tip placement="right" text={text}>
            <NavLink to={url}>
              <NavIcon className={icon} />
              {label}
            </NavLink>
          </Tip>
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
            __('Conversation'),
            '/inbox',
            'icon-chat',
            unreadIndicator
          )}
          {this.renderNavItem(
            'showGrowthHacks',
            __('Growth Hacking'),
            '/growthHack',
            'icon-idea'
          )}
          {this.renderNavItem(
            'showDeals',
            __('Deal'),
            '/deal',
            'icon-piggy-bank'
          )}
          {this.renderNavItem(
            'showCustomers',
            __('Contacts'),
            '/contacts',
            'icon-users'
          )}
          {this.renderNavItem(
            'showForms',
            __('Forms'),
            '/forms',
            'icon-laptop'
          )}
          {this.renderNavItem(
            'showEngagesMessages',
            __('Campaigns'),
            '/campaigns',
            'icon-megaphone'
          )}
          {this.renderNavItem(
            'showKnowledgeBase',
            __('Knowledge Base'),
            '/knowledgeBase',
            'icon-book'
          )}
          {this.renderCollapse()}

          {pluginsOfNavigations(this.renderNavItem)}
        </Nav>
      </LeftNavigation>
    );
  }
}

export default Navigation;
