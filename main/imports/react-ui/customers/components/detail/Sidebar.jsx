import React from 'react';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { Wrapper } from '../../../layout/components';


function Sidebar() {
  const top = (
    <DropdownButton
      title="All Segments (1240)"
      id="segments-filter"
      bsSize="small"
    >
      <MenuItem eventKey="1">Action</MenuItem>
      <MenuItem eventKey="2">Another action</MenuItem>
    </DropdownButton>
  );

  return (
    <Wrapper.Sidebar top={top}>
      <div className="box margined">
        <ul className="list-group bordered">
          <li>
            <div className="title">
              <div className="full-name">
                <a href="/details">Anar-Erdene Batjargal </a>
              </div>
              <div>anarerdene.b@nmtec.co</div>
              <small className="date">
                About 11min ago
              </small>
            </div>
          </li>
          <li>
            <div className="title">
              <div className="full-name">
                <a href="/details">Anar-Erdene Batjargal </a>
              </div>
              <div>anarerdene.b@nmtec.co</div>
              <small className="date">
                About 11min ago
              </small>
            </div>
          </li>
        </ul>
      </div>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
