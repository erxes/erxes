import React from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';


const propTypes = {};

function RightSidebar() {
  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
        <h3>Activities</h3>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

RightSidebar.propTypes = propTypes;

export default RightSidebar;
