import React from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';
import { FlowRouter } from 'meteor/kadira:flow-router';

function Sidebar() {
  const { Title } = Wrapper.Sidebar.Section;
  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
        <Title>Insights</Title>
        <ul className="sidebar-list">
          <li>
            <a href={FlowRouter.path('insights')}>Insights</a>
          </li>
          <li>
            <a href={FlowRouter.path('insights/team-members')}>Team members</a>
          </li>
          <li>
            <a href={FlowRouter.path('insights/punch-card')}>Punch card</a>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
