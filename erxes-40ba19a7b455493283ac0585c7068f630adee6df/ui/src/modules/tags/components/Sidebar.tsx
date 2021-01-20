import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { SidebarList } from 'modules/layout/styles';
import React from 'react';
import { NavLink } from 'react-router-dom';

function TagsSidebar() {
  const { Title } = Sidebar.Section;

  return (
    <Sidebar>
      <Sidebar.Section>
        <Title>{__('Tags type')}</Title>
        <SidebarList id={'TagsSidebar'}>
          <li>
            <NavLink activeClassName="active" to="/tags/engageMessage">
              {__('Engage Message')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/tags/conversation">
              {__('Conversation')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/tags/customer">
              {__('Customer')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/tags/company">
              {__('Company')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/tags/integration">
              {__('Integration')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/tags/product">
              {__('Product & Service')}
            </NavLink>
          </li>
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

export default TagsSidebar;
