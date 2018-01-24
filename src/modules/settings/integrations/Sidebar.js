import React from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';
import { Title } from '../styles';

function IntegrationsSidebar() {
  const { QuickButtons } = Sidebar.Section;

  return (
    <Sidebar>
      <Sidebar.Section>
        <Sidebar.Header>
          <Title>Integrations</Title>
          <QuickButtons>
            <Link to="/settings/integrations">All</Link>
          </QuickButtons>
        </Sidebar.Header>
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
    </Sidebar>
  );
}

export default IntegrationsSidebar;
