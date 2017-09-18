import React, { PropTypes } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';

function Main({ counts }) {
  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar.Section>
      <Title>Kind</Title>
      <ul className="sidebar-list">
        <li>
          <a href={`${FlowRouter.path('engage/home')}`}>
            <i className="icon ion-arrow-right-b" />All
            <span className="counter">{counts.all}</span>
          </a>
        </li>
        <li>
          <a href={`${FlowRouter.path('engage/home')}?kind=auto`}>
            <i className="icon ion-arrow-right-b" />Auto
            <span className="counter">{counts.auto}</span>
          </a>
        </li>
        <li>
          <a href={`${FlowRouter.path('engage/home')}?kind=visitorAuto`}>
            <i className="icon ion-arrow-right-b" />Visitor auto
            <span className="counter">{counts.visitorAuto}</span>
          </a>
        </li>
        <li>
          <a href={`${FlowRouter.path('engage/home')}?kind=manual`}>
            <i className="icon ion-arrow-right-b" />Manual
            <span className="counter">{counts.manual}</span>
          </a>
        </li>
      </ul>
    </Wrapper.Sidebar.Section>
  );
}

Main.propTypes = {
  counts: PropTypes.object,
};

export default Main;
