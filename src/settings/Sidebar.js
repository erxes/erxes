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
          <li><Link to="channels">Channels</Link></li>
          <li><Link to="brands">Brands</Link></li>
          <li><Link to="team">Team members</Link></li>
          <li><Link to="response-templates">Response templates</Link></li>
          <li><Link to="email-templates">Email templates</Link></li>
          <li><Link to="emails">Email appearance</Link></li>
          <li><Link to="forms">Forms</Link></li>
        </SidebarList>
      </Wrapper.Sidebar.Section>

      <Wrapper.Sidebar.Section>
        <Title>Integrations</Title>
        <QuickButtons>
          <QuickButton href="integrations/list">
            All
          </QuickButton>
        </QuickButtons>
        <SidebarList>
          <li><Link to="integrations?kind=messenger">Messenger</Link></li>
          <li><Link to="integrations?kind=form">Form</Link></li>
          <li><Link to="integrations?kind=twitter">Twitter</Link></li>
          <li><Link to="integrations?kind=facebook">Facebook</Link></li>
        </SidebarList>
      </Wrapper.Sidebar.Section>

      <Wrapper.Sidebar.Section>
        <Title>Knowledge base</Title>
        <QuickButtons>
          <QuickButton href="knowledgebase/listt">
            All
          </QuickButton>
        </QuickButtons>
        <SidebarList>
          <li><Link to="knowledgebase/list">Topics</Link></li>
          <li><Link to="knowledgebase/categories">Categories</Link></li>
          <li><Link to="knowledgebase/articles">Articles</Link></li>
        </SidebarList>
      </Wrapper.Sidebar.Section>

      <Wrapper.Sidebar.Section>
        <Title>Personal settings</Title>
        <SidebarList>
          <li><Link to="profile">Profile</Link></li>
          <li><Link to="change-password">Change password</Link></li>
          <li><Link to="emails/signatures">Email signatures</Link></li>
          <li><Link to="notification-settings">Notification settings</Link></li>
        </SidebarList>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
