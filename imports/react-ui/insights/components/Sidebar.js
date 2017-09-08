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
            <a href={FlowRouter.path('insights')}>Volume Report</a>
          </li>
          <li>
            <a href={FlowRouter.path('insights/response-report')}>Response Report</a>
          </li>
          <li>
            <a href={FlowRouter.path('insights/first-response')}>First Response Report</a>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
