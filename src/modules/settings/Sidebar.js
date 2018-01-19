import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Sidebar } from '../layout/components';
import { SidebarList } from '../layout/styles';

function SettingsSidebar() {
  const { Title, QuickButtons } = Sidebar.Section;

  return (
    <Sidebar>
      <Sidebar.Section>
        <Title>Account settings</Title>
        <SidebarList>
          <li>
            <NavLink activeClassName="active" to="/settings/brands">
              Brands
            </NavLink>
          </li>
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
        </SidebarList>
      </Sidebar.Section>

      <Sidebar.Section>
        <Title>Integrations</Title>
        <QuickButtons>
          <Link to="/settings/integrations">All</Link>
        </QuickButtons>
        <SidebarList>
          <li>
            <Link to="/settings/integrations?kind=messenger">Messenger</Link>
          </li>
          <li>
            <Link to="/settings/integrations?kind=form">Form</Link>
          </li>
          <li>
            <Link to="/settings/integrations?kind=twitter">Twitter</Link>
          </li>
          <li>
            <Link to="/settings/integrations?kind=facebook">Facebook</Link>
          </li>
        </SidebarList>
      </Sidebar.Section>

      <Sidebar.Section>
        <Title>Knowledge base</Title>
        <QuickButtons>
          <Link to="/settings/knowledgebase/list">All</Link>
        </QuickButtons>
        <SidebarList>
          <li>
            <NavLink activeClassName="active" to="/settings/knowledgebase/list">
              Topics
            </NavLink>
          </li>
          <li>
            <NavLink
              activeClassName="active"
              to="/settings/knowledgebase/categories"
            >
              Categories
            </NavLink>
          </li>
          <li>
            <NavLink
              activeClassName="active"
              to="/settings/knowledgebase/articles"
            >
              Articles
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
