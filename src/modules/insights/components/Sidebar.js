import React from 'react';
import { Wrapper } from 'modules/layout/components';

function Sidebar() {
  const Sidebar = Wrapper.Sidebar;
  const { Title } = Sidebar.Section;

  return (
    <Sidebar full>
      <Sidebar.Section noShadow>
        <Title>Insights</Title>
        <ul className="sidebar-list">
          <li>
            <a href="/insights">
              <i className="icon ion-arrow-right-b" />Volume Report
            </a>
          </li>
          <li>
            <a href="/insights/response-report">
              <i className="icon ion-arrow-right-b" />Response Report
            </a>
          </li>
          <li>
            <a href="/insights/first-response">
              <i className="icon ion-arrow-right-b" />First Response Report
            </a>
          </li>
        </ul>
      </Sidebar.Section>
    </Sidebar>
  );
}

export default Sidebar;
