import React from 'react';
import { Link } from 'react-router-dom';
import { Wrapper } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';

function Sidebar() {
  const Sidebar = Wrapper.Sidebar;
  const { Title } = Sidebar.Section;

  return (
    <Sidebar>
      <Sidebar.Section noShadow>
        <Title>Insights</Title>
        <SidebarList>
          <li>
            <Link to="/insights">Volume Report</Link>
          </li>
          <li>
            <Link to="/insights/response-report">Response Report</Link>
          </li>
          <li>
            <Link to="/insights/response-close-report">
              Response Close Report
            </Link>
          </li>
          <li>
            <Link to="/insights/first-response">First Response Report</Link>
          </li>
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

export default Sidebar;
