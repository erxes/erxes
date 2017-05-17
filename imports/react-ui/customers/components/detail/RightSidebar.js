import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '/imports/react-ui/layout/components';
import { EmptyState } from '/imports/react-ui/common';
import { InternalNotes } from '/imports/react-ui/customers/containers';

const propTypes = {
  customerId: PropTypes.string.isRequired,
};

function RightSidebar({ customerId }) {
  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
        <h3>Activities</h3>
        <EmptyState icon={<i className="ion-flash" />} text="No activities" size="small" />
      </Wrapper.Sidebar.Section>
      <InternalNotes customerId={customerId} />
    </Wrapper.Sidebar>
  );
}

RightSidebar.propTypes = propTypes;

export default RightSidebar;
