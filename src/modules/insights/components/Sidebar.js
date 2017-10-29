import React from 'react';
import { Link } from 'react-router-dom';
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
            <Link to="/insights">
              <i className="icon ion-arrow-right-b" />Volume Report
            </Link>
          </li>
          <li>
            <Link to="/insights/response-report">
              <i className="icon ion-arrow-right-b" />Response Report
            </Link>
          </li>
          <li>
            <Link to="/insights/first-response">
              <i className="icon ion-arrow-right-b" />First Response Report
            </Link>
          </li>
        </ul>
      </Sidebar.Section>
    </Sidebar>
  );
}

export default Sidebar;
