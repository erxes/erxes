import { __ } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList } from 'modules/layout/styles';
import React from 'react';
import { NavLink } from 'react-router-dom';
import SidebarHeader from 'modules/settings/common/components/SidebarHeader';

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
        <li>
          <NavLink activeClassName="active" to="/tags/booking">
            {__('Booking')}
          </NavLink>
        </li>
      </SidebarList>
    </LeftSidebar>
  );
}

export default TagsSidebar;
