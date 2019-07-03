import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';
import React from 'react';
import { NavLink } from 'react-router-dom';

function TagsSidebar() {
  const { Title } = Sidebar.Section;

  return (
    <Sidebar>
      <Sidebar.Section>
        <Title>{__('Segments')}</Title>
        <SidebarList>
          <li>
            <NavLink activeClassName="active" to="/segments/customer">
              {__('Customer')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/segments/company">
              {__('Company')}
            </NavLink>
          </li>
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

export default TagsSidebar;
