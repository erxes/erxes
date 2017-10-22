import React from 'react';
import { Wrapper } from 'modules/layout/components';

function Sidebar() {
  const { Title } = Wrapper.Sidebar.Section;
  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
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
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
