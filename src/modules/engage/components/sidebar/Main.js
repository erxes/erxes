import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';

function Main({ counts }) {
  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar.Section>
      <Title>Kind</Title>
      <ul className="sidebar-list">
        <li>
          <Link to="/engage">
            <i className="icon ion-arrow-right-b" />All
            <span className="counter">{counts.all}</span>
          </Link>
        </li>
        <li>
          <Link to={`/engage?kind=auto`}>
            <i className="icon ion-arrow-right-b" />Auto
            <span className="counter">{counts.auto}</span>
          </Link>
        </li>
        <li>
          <Link to={`/engage?kind=visitorAuto`}>
            <i className="icon ion-arrow-right-b" />Visitor auto
            <span className="counter">{counts.visitorAuto}</span>
          </Link>
        </li>
        <li>
          <Link to={`/engage?kind=manual`}>
            <i className="icon ion-arrow-right-b" />Manual
            <span className="counter">{counts.manual}</span>
          </Link>
        </li>
      </ul>
    </Wrapper.Sidebar.Section>
  );
}

Main.propTypes = {
  counts: PropTypes.object
};

export default Main;
