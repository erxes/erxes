import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';

function Main({ counts }) {
  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar.Section>
      <Title>Kind</Title>
      <ul className="sidebar-list">
        <li>
          <a href="/engage">
            <i className="icon ion-arrow-right-b" />All
            <span className="counter">{counts.all}</span>
          </a>
        </li>
        <li>
          <a href={`/engage?kind=auto`}>
            <i className="icon ion-arrow-right-b" />Auto
            <span className="counter">{counts.auto}</span>
          </a>
        </li>
        <li>
          <a href={`/engage?kind=visitorAuto`}>
            <i className="icon ion-arrow-right-b" />Visitor auto
            <span className="counter">{counts.visitorAuto}</span>
          </a>
        </li>
        <li>
          <a href={`/engage?kind=manual`}>
            <i className="icon ion-arrow-right-b" />Manual
            <span className="counter">{counts.manual}</span>
          </a>
        </li>
      </ul>
    </Wrapper.Sidebar.Section>
  );
}

Main.propTypes = {
  counts: PropTypes.object
};

export default Main;
