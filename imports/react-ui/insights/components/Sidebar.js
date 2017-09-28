import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';

function Sidebar() {
  const { Title } = Wrapper.Sidebar.Section;
  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
        <Title>Insights</Title>
        <ul className="sidebar-list">
          <li>
            <a href={FlowRouter.path('insights')}>
              <i className="icon ion-arrow-right-b" />Volume Report
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('insights/response-report')}>
              <i className="icon ion-arrow-right-b" />Response Report
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('insights/first-response')}>
              <i className="icon ion-arrow-right-b" />First Response Report
            </a>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
