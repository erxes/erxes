import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar } from '../layout/components';
import { SidebarList } from '../layout/styles';

function SettingsSidebar() {
  const { Title } = Sidebar.Section;

  return (
    <Sidebar>
      <Sidebar.Section>
        <Title>Account settings</Title>
        <SidebarList>
          <li>
            <NavLink activeClassName="active" to="/settings/team">
              Team members
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/response-templates">
              Response templates
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/email-templates">
              Email templates
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/emails">
              Email appearance
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/forms">
              Forms
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/permissions">
              Permissions
            </NavLink>
          </li>
        </SidebarList>
      </Sidebar.Section>

      <Sidebar.Section>
        <Title>Personal settings</Title>
        <SidebarList>
          <li>
            <NavLink activeClassName="active" to="/settings/profile">
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/change-password">
              Change password
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/emails/signatures">
              Email signatures
            </NavLink>
          </li>
          <li>
            <NavLink
              activeClassName="active"
              to="/settings/notification-settings"
            >
              Notification settings
            </NavLink>
          </li>
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

export default SettingsSidebar;
