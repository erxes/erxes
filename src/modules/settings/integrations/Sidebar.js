import React from 'react';
import { Link } from 'react-router-dom';
import { Wrapper } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';

function IntegrationsSidebar() {
  const { Section, Header } = Wrapper.Sidebar;

  return (
    <Wrapper.Sidebar>
      <Section>
        <Header spaceBottom>Integrations</Header>
        <SidebarList>
          <li>
            <Link to="/settings/integrations">All</Link>
          </li>
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
      </Section>
    </Wrapper.Sidebar>
  );
}

export default IntegrationsSidebar;
