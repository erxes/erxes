import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

function Main({ counts }, { __ }) {
  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar.Section>
      <Title>{__('Kind')}</Title>
      <SidebarList>
        <li>
          <Link to="/engage">
            {__('All')}
            <SidebarCounter>{counts.all}</SidebarCounter>
          </Link>
        </li>
        <li>
          <Link to={`/engage?kind=auto`}>
            {__('Auto')}
            <SidebarCounter>{counts.auto}</SidebarCounter>
          </Link>
        </li>
        <li>
          <Link to={`/engage?kind=visitorAuto`}>
            {__('Visitor auto')}
            <SidebarCounter>{counts.visitorAuto}</SidebarCounter>
          </Link>
        </li>
        <li>
          <Link to={`/engage?kind=manual`}>
            {__('Manual')}
            <SidebarCounter>{counts.manual}</SidebarCounter>
          </Link>
        </li>
      </SidebarList>
    </Wrapper.Sidebar.Section>
  );
}

Main.propTypes = {
  counts: PropTypes.object
};

Main.contextTypes = {
  __: PropTypes.func
};

export default Main;
