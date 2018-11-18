import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';
import * as React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  const WrapperSidebar = Wrapper.Sidebar;
  const { Title } = WrapperSidebar.Section;

  return (
    <WrapperSidebar>
      <WrapperSidebar.Section>
        <Title>{__('Insights')}</Title>
        <SidebarList>
          <li>
            <NavLink
              activeClassName="active"
              exact={true}
              to="/insights/volume-report"
            >
              {__('Volume Report')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/insights/response-report">
              {__('Response Report')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/insights/summary-report">
              {__('Volume Report By Customer')}
            </NavLink>
          </li>
          <li>
            <NavLink
              activeClassName="active"
              to="/insights/response-close-report"
            >
              {__('Response Close Report')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/insights/first-response">
              {__('First Response Report')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/insights/export-report">
              {__('Export Report')}
            </NavLink>
          </li>
        </SidebarList>
      </WrapperSidebar.Section>
    </WrapperSidebar>
  );
}

export default Sidebar;
