import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Wrapper } from 'modules/layout/components';
import { NameCard } from 'modules/common/components';
import TaggerSection from './TaggerSection';
import MessengerSection from './MessengerSection';
import TwitterSection from './TwitterSection';
import FacebookSection from './FacebookSection';

const propTypes = {
  customer: PropTypes.object.isRequired
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
            <span className="counter">
              {moment(customer.createdAt).fromNow()}
            </span>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
      <MessengerSection customer={customer} />
      <TwitterSection customer={customer} />
      <FacebookSection customer={customer} />
      <TaggerSection customer={customer} />
    </Wrapper.Sidebar>
  );
}

RightSidebar.propTypes = propTypes;

export default RightSidebar;
