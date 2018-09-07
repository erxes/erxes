import * as React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Sidebar } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';

function IntegrationsSidebar(props, { __ }) {
  const { Title } = Sidebar.Section;

  return (
    <Sidebar>
      <Sidebar.Section>
        <Title>{__('Integration menu')}</Title>
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
              {__('Integrations')}
            </NavLink>
          </li>
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

IntegrationsSidebar.contextTypes = {
  __: PropTypes.func
};

export default IntegrationsSidebar;
