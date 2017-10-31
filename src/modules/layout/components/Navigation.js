import React from 'react';
import { Link } from 'react-router-dom';
import { Tip, Icon } from 'modules/common/components';
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
            <Icon icon="ios-chatboxes" />
          </Link>
        </Tip>
        <Tip placement="right" text="Customers">
          <Link to="/customers">
            <Icon icon="person-stalker" />
          </Link>
        </Tip>
        <Tip placement="right" text="Companies">
          <Link to="/companies">
            <Icon icon="briefcase" />
          </Link>
        </Tip>
        <Tip placement="right" text="Engage">
          <Link to="/engage">
            <Icon icon="speakerphone" />
          </Link>
        </Tip>
        <Tip placement="right" text="Insights">
          <Link to="/insights">
            <Icon icon="pie-graph" />
          </Link>
        </Tip>
        <Tip placement="right" text="Settings">
          <Link to="/settings/channels">
            <Icon icon="gear-b" />
          </Link>
        </Tip>
      </Nav>
    </LeftNavigation>
  );
}

export default Navigation;
