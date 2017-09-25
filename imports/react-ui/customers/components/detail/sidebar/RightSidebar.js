import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Wrapper } from '/imports/react-ui/layout/components';
import { EmptyState } from '/imports/react-ui/common';
import { InternalNotes } from '/imports/react-ui/customers/containers';
import { NameCard } from '/imports/react-ui/common';
import TaggerSection from './TaggerSection';
import MessengerSection from './MessengerSection';
import TwitterSection from './TwitterSection';
import FacebookSection from './FacebookSection';

const propTypes = {
  customer: PropTypes.object.isRequired,
};

function RightSidebar({ customer }) {
  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section>
        <h3>Customer details</h3>
        <ul className="sidebar-list no-link">
          <li>
            <NameCard customer={customer} avatarSize={40} />
          </li>
          <li>
            Created
            <span className="counter">{moment(customer.createdAt).fromNow()}</span>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
      <Wrapper.Sidebar.Section>
        <h3>Activities</h3>
        <EmptyState icon={<i className="ion-flash" />} text="No activities" size="small" />
      </Wrapper.Sidebar.Section>
      <InternalNotes customer={customer} />
      <MessengerSection customer={customer} />
      <TwitterSection customer={customer} />
      <FacebookSection customer={customer} />
      <TaggerSection customer={customer} />
    </Wrapper.Sidebar>
  );
}

RightSidebar.propTypes = propTypes;

export default RightSidebar;
