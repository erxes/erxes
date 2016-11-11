import React from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';


function Sidebar() {
  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
        <h3>Segments</h3>
        <ul className="filters">
          <li>
            <a href="#">
              All company
              <span className="counter">3</span>
            </a>
          </li>
          <li>
            <a href="#">
              New
              <span className="counter">10</span>
            </a>
          </li>
          <li>
            <a href="#">
              Paid
              <span className="counter">10</span>
            </a>
          </li>
          <li>
            <a href="#">
              Custom
              <span className="counter">3</span>
            </a>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
