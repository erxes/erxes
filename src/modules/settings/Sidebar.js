import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Sidebar } from '../layout/components';
import { SidebarList } from '../layout/styles';
import { ShowContent } from 'modules/common/components';

function SettingsSidebar(props, { __, can }) {
  const { Title } = Sidebar.Section;

  return (
    <Sidebar>
      <Sidebar.Section>
        <Title>{__('Account settings')}</Title>
        <SidebarList>
          <li>
            <NavLink activeClassName="active" to="/settings/team">
              {__('Team members')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/response-templates">
              {__('Response templates')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/email-templates">
              {__('Email templates')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/emails">
              {__('Email appearance')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/forms">
              {__('Forms')}
            </NavLink>
          </li>
          <ShowContent show={can('showPermissionList')}>
            <li>
              <NavLink activeClassName="active" to="/settings/permissions">
                {__('Permissions')}
              </NavLink>
            </li>
          </ShowContent>
          <li>
            <NavLink activeClassName="active" to="/settings/users/groups">
              {__('Users groups')}
            </NavLink>
          </li>
        </SidebarList>
      </Sidebar.Section>

      <Sidebar.Section>
        <Title>{__('Personal settings')}</Title>
        <SidebarList>
          <li>
            <NavLink activeClassName="active" to="/settings/profile">
              {__('Profile')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/change-password">
              {__('Change password')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/emails/signatures">
              {__('Email signatures')}
            </NavLink>
          </li>
          <li>
            <NavLink
              activeClassName="active"
              to="/settings/notification-settings"
            >
              {__('Notification settings')}
            </NavLink>
          </li>
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

SettingsSidebar.contextTypes = {
  __: PropTypes.func,
  can: PropTypes.func
};

export default SettingsSidebar;
