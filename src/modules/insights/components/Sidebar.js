import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Wrapper } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';

function Sidebar(props, { __ }) {
  const Sidebar = Wrapper.Sidebar;
  const { Title } = Sidebar.Section;

  return (
    <Sidebar>
      <Sidebar.Section>
        <Title>{__('Insights')}</Title>
        <SidebarList>
          <li>
            <NavLink
              activeClassName="active"
              exact
              to="/insights/volume-report"
            >
              {__('Volume Report')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/insights/response-report">
              {__('Response Report')}
            </NavLink>
          </li>
          <li>
            <NavLink
              activeClassName="active"
              to="/insights/response-close-report"
            >
              {__('Response Close Report')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/insights/first-response">
              {__('First Response Report')}
            </NavLink>
          </li>
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

Sidebar.contextTypes = {
  __: PropTypes.func
};

export default Sidebar;
