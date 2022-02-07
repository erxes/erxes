import { __ } from '@erxes/ui/src/utils';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { NavLink } from 'react-router-dom';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

function TagsSidebar() {
  return (
    <LeftSidebar full={true} header={<SidebarHeader />}>
      <LeftSidebar.Header uppercase={true}>
        {__('Tags type')}
      </LeftSidebar.Header>
      <SidebarList id={'TagsSidebar'}>
        <li>
          <NavLink activeClassName="active" to="/tags/engageMessage">
            {__('Campaign')}
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
    </LeftSidebar>
  );
}

export default TagsSidebar;
