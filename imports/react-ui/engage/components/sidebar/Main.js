import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { Wrapper } from '/imports/react-ui/layout/components';

function Main() {
  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar.Section>
      <Title>Kind</Title>
      <ul className="filters">
        <li>
          <a href={`${FlowRouter.path('engage/home')}`}>
            <i className="icon ion-arrow-right-b" />All

            <span className="counter">
              {Counts.get('engage.messages.all')}
            </span>
          </a>
        </li>
        <li>
          <a href={`${FlowRouter.path('engage/home')}?kind=auto`}>
            <i className="icon ion-arrow-right-b" />Auto

            <span className="counter">
              {Counts.get('engage.messages.auto')}
            </span>
          </a>
        </li>
        <li>
          <a href={`${FlowRouter.path('engage/home')}?kind=visitorAuto`}>
            <i className="icon ion-arrow-right-b" />Visitor auto

            <span className="counter">
              {Counts.get('engage.messages.visitorAuto')}
            </span>
          </a>
        </li>
        <li>
          <a href={`${FlowRouter.path('engage/home')}?kind=manual`}>
            <i className="icon ion-arrow-right-b" />Manual

            <span className="counter">
              {Counts.get('engage.messages.manual')}
            </span>
          </a>
        </li>
      </ul>
    </Wrapper.Sidebar.Section>
  );
}

export default Main;
