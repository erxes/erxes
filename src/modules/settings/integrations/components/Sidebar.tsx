import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

function IntegrationsSidebar(props) {
  const { Title } = Sidebar.Section;

  return (
    <Sidebar>
      <Sidebar.Section>
        <Title>{__('App store menu')}</Title>
        <SidebarList>
          <li>
            <NavLink activeClassName="active" to="/settings/channels">
              {__('Channels')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/brands">
              {__('Brands')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/integrations">
              {__('App store')}
            </NavLink>
          </li>
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

export default IntegrationsSidebar;
