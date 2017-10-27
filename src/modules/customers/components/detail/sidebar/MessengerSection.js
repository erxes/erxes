import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Wrapper } from 'modules/layout/components';
import { Label } from 'modules/common/components';

const propTypes = {
  customer: PropTypes.object.isRequired
};

function MessengerSection({ customer }) {
  const { messengerData } = customer;

  if (!messengerData) {
    return null;
  }

  const { Title } = Wrapper.Sidebar.Section;

  return (
    <Wrapper.Sidebar.Section>
      <Title>Messenger</Title>
      <ul className="sidebar-list no-link">
        <li>
          Status
          <span className="counter">
            {messengerData.isActive ? (
              <Label lblStyle="success">Online</Label>
            ) : (
              <Label>Offline</Label>
            )}
          </span>
        </li>
        <li>
          Last online
          <span className="counter">
            {moment(messengerData.lastSeenAt).fromNow()}
          </span>
        </li>
        <li>
          Session count
          <span className="counter">{messengerData.sessionCount}</span>
        </li>
      </ul>
    </Wrapper.Sidebar.Section>
  );
}

MessengerSection.propTypes = propTypes;

export default MessengerSection;
