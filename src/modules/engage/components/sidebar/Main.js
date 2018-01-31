import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';

function Main({ counts }) {
  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar.Section>
      <Title>Kind</Title>
      <SidebarList>
        <li>
          <Link to="/engage">
            All
            <SidebarCounter>{counts.all}</SidebarCounter>
          </Link>
        </li>
        <li>
          <Link to={`/engage?kind=auto`}>
            Auto
            <SidebarCounter>{counts.auto}</SidebarCounter>
          </Link>
        </li>
        <li>
          <Link to={`/engage?kind=visitorAuto`}>
            Visitor auto
            <SidebarCounter>{counts.visitorAuto}</SidebarCounter>
          </Link>
        </li>
        <li>
          <Link to={`/engage?kind=manual`}>
            Manual
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

export default Main;
