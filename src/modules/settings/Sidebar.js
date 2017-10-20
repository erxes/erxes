import React from 'react';
import { Link } from 'react-router-dom'
import { Wrapper } from '../layout/components';
import { QuickButton } from '../layout/styles';
import { SidebarList } from './styles';

function Sidebar() {
  const { Title, QuickButtons } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
        <Title>Account settings</Title>
        <SidebarList>
          <li><Link to="/settings/channels">Channels</Link></li>
          <li><Link to="/settings/brands">Brands</Link></li>
          <li><Link to="/settings/team">Team members</Link></li>
          <li><Link to="/settings/response-templates">Response templates</Link></li>
          <li><Link to="/settings/email-templates">Email templates</Link></li>
          <li><Link to="/settings/emails">Email appearance</Link></li>
          <li><Link to="/settings/forms">Forms</Link></li>
        </SidebarList>
      </Wrapper.Sidebar.Section>

      <Wrapper.Sidebar.Section>
        <Title>Integrations</Title>
        <QuickButtons>
          <QuickButton href="/settings/integrations/list">
            All
          </QuickButton>
        </QuickButtons>
        <SidebarList>
          <li><Link to="/settings/integrations?kind=messenger">Messenger</Link></li>
          <li><Link to="/settings/integrations?kind=form">Form</Link></li>
          <li><Link to="/settings/integrations?kind=twitter">Twitter</Link></li>
          <li><Link to="/settings/integrations?kind=facebook">Facebook</Link></li>
        </SidebarList>
      </Wrapper.Sidebar.Section>

      <Wrapper.Sidebar.Section>
        <Title>Knowledge base</Title>
        <QuickButtons>
          <QuickButton href="/settings/knowledgebase/listt">
            All
          </QuickButton>
        </QuickButtons>
        <SidebarList>
          <li><Link to="/settings/knowledgebase/list">Topics</Link></li>
          <li><Link to="/settings/knowledgebase/categories">Categories</Link></li>
          <li><Link to="/settings/knowledgebase/articles">Articles</Link></li>
        </SidebarList>
      </Wrapper.Sidebar.Section>

      <Wrapper.Sidebar.Section>
        <Title>Personal settings</Title>
        <SidebarList>
          <li><Link to="/settings/profile">Profile</Link></li>
          <li><Link to="/settings/change-password">Change password</Link></li>
          <li><Link to="/settings/emails/signatures">Email signatures</Link></li>
          <li><Link to="/settings/notification-settings">Notification settings</Link></li>
        </SidebarList>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
