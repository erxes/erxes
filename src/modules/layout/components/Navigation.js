import React from 'react';
import { Link } from 'react-router-dom';
import { LeftNavigation, Nav } from '../styles';

function Navigation() {
  return (
    <LeftNavigation>
      <Link to="/">
        <img src="/images/logo-image.png" alt="erxes" />
      </Link>
      <Nav>
        <Link to="/inbox">
          <i className="ion-ios-chatboxes" />
        </Link>
        <Link to="/customers">
          <i className="ion-person-stalker" />
        </Link>
        <Link to="/companies">
          <i className="ion-briefcase" />
        </Link>
        <Link to="/engage">
          <i className="ion-speakerphone" />
        </Link>
        <Link to="/insights">
          <i className="ion-pie-graph" />
        </Link>
        <Link to="/settings/channels">
          <i className="ion-gear-b" />
        </Link>
      </Nav>
    </LeftNavigation>
  );
}

export default Navigation;
