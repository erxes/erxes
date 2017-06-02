import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';

function Sidebar() {
  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
        <Title>Filter</Title>
        <ul className="filters">
          <li>
            <a href={`${FlowRouter.path('engage/messages/list')}?type=auto`}>
              <i className="icon ion-arrow-right-b" />Auto
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('engage/messages/list')}>
              <i className="icon ion-arrow-right-b" />Manual
            </a>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
