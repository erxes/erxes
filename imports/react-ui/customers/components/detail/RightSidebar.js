import React from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';
import { EmptyState } from '/imports/react-ui/common';

const propTypes = {};

function RightSidebar() {
  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
        <h3>Activities</h3>
        <EmptyState icon={<i className="ion-flash" />} text="No activities" size="small" />
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

RightSidebar.propTypes = propTypes;

export default RightSidebar;
