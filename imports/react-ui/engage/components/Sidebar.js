import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Wrapper } from '/imports/react-ui/layout/components';

function Sidebar() {
  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
        <Title>Filter by type</Title>
        <ul className="filters">
          <li>
            <a href={`${FlowRouter.path('engage/messages/list')}?type=auto`}>
              <span className="icon">#</span> Auto messages
            </a>
          </li>
          <li>
            <a href={FlowRouter.path('engage/messages/list')}>
              <span className="icon">#</span> Manual messages
            </a>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
