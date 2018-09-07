import * as React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { Sidebar } from '../layout/components';
import { SidebarList } from '../layout/styles';

function SettingsSidebar(props, { __ }) {
  const { Title } = Sidebar.Section;

  return (
    <Sidebar>
      <Sidebar.Section>
        <Title>{__('Account settings')}</Title>
        <SidebarList>
          <li>
            <NavLink activeClassName="active" to="/settings/team">
              {__('Team members')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/response-templates">
              {__('Response templates')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/email-templates">
              {__('Email templates')}
            </NavLink>
          </li>
          <li>
            <NavLink activeClassName="active" to="/settings/emails">
              {__('Email appearance')}
            </NavLink>
          </li>
        </SidebarList>
      </Sidebar.Section>
    </Sidebar>
  );
}

SettingsSidebar.contextTypes = {
  __: PropTypes.func
};

export default SettingsSidebar;
