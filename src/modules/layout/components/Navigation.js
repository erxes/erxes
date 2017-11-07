import React from 'react';
import { NavLink } from 'react-router-dom';
import { Tip, Icon } from 'modules/common/components';
import { LeftNavigation, Nav } from '../styles';

function Navigation() {
  return (
    <LeftNavigation>
      <NavLink to="/" activeClassName="active">
        <img src="/images/logo-image.png" alt="erxes" />
      </NavLink>
      <Nav>
        <Tip placement="right" text="Inbox">
          <NavLink to="/inbox" activeClassName="active">
            <Icon icon="ios-chatboxes" />
          </NavLink>
        </Tip>
        <Tip placement="right" text="Customers">
          <NavLink to="/customers" activeClassName="active">
            <Icon icon="person-stalker" />
          </NavLink>
        </Tip>
        <Tip placement="right" text="Companies">
          <NavLink to="/companies" activeClassName="active">
            <Icon icon="briefcase" />
          </NavLink>
        </Tip>
        <Tip placement="right" text="Engage">
          <NavLink to="/engage" activeClassName="active">
            <Icon icon="speakerphone" />
          </NavLink>
        </Tip>
        <Tip placement="right" text="Insights">
          <NavLink to="/insights" activeClassName="active">
            <Icon icon="pie-graph" />
          </NavLink>
        </Tip>
        <Tip placement="right" text="Settings">
          <NavLink to="/settings/channels" activeClassName="active">
            <Icon icon="gear-b" />
          </NavLink>
        </Tip>
      </Nav>
    </LeftNavigation>
  );
}

export default Navigation;
