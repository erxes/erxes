import React from 'react';
import { Link } from 'react-router-dom';
import { Tip } from 'modules/common/components';
import { LeftNavigation, Nav } from '../styles';

function Navigation() {
  return (
    <LeftNavigation>
      <Link to="/">
        <img src="/images/logo-image.png" alt="erxes" />
      </Link>
      <Nav>
        <Tip placement="right" text="Inbox">
          <Link to="/inbox">
            <i className="ion-ios-chatboxes" />
          </Link>
        </Tip>
        <Tip placement="right" text="Customers">
          <Link to="/customers">
            <i className="ion-person-stalker" />
          </Link>
        </Tip>
        <Tip placement="right" text="Companies">
          <Link to="/companies">
            <i className="ion-briefcase" />
          </Link>
        </Tip>
        <Tip placement="right" text="Engage">
          <Link to="/engage">
            <i className="ion-speakerphone" />
          </Link>
        </Tip>
        <Tip placement="right" text="Insights">
          <Link to="/insights">
            <i className="ion-pie-graph" />
          </Link>
        </Tip>
        <Tip placement="right" text="Channels">
          <Link to="/settings/channels">
            <i className="ion-gear-b" />
          </Link>
        </Tip>
      </Nav>
    </LeftNavigation>
  );
}

export default Navigation;
