import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';

function Main({ counts }) {
  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar.Section>
      <Title>Kind</Title>
      <SidebarList>
        <li>
          <Link to="/engage">
            All
            <span>{counts.all}</span>
          </Link>
        </li>
        <li>
          <Link to={`/engage?kind=auto`}>
            Auto
            <span>{counts.auto}</span>
          </Link>
        </li>
        <li>
          <Link to={`/engage?kind=visitorAuto`}>
            Visitor auto
            <span>{counts.visitorAuto}</span>
          </Link>
        </li>
        <li>
          <Link to={`/engage?kind=manual`}>
            Manual
            <span>{counts.manual}</span>
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
