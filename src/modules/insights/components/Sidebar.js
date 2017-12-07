import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wrapper } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';

function Sidebar() {
  const Sidebar = Wrapper.Sidebar;
  const { Title } = Sidebar.Section;

  return (
    <Sidebar>
      <Sidebar.Section>
        <Title>Insights</Title>
        <SidebarList>
          <li>
            <NavLink activeClassName="active" exact to="/insights">
              Volume Report
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/insights/response-report">
              Response Report
            </NavLink>
          </li>
          <li>
            <NavLink
              activeClassName="active"
              to="/insights/response-close-report"
            >
              Response Close Report
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/insights/first-response">
              First Response Report
            </NavLink>
          </li>
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

export default Sidebar;
