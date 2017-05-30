import React from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';

function Sidebar() {
  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
        <Title>Filter</Title>
        <ul className="filters">
          <li>
            <a><i className="icon ion-arrow-right-b" />Auto</a>
          </li>
          <li>
            <a><i className="icon ion-arrow-right-b" />Manual</a>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
