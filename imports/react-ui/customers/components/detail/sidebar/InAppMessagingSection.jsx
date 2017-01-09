import React, { PropTypes } from 'react';
import moment from 'moment';
import { Label } from 'react-bootstrap';
import { Wrapper } from '/imports/react-ui/layout/components';


const propTypes = {
  customer: PropTypes.object.isRequired,
};

function InAppMessagingSection({ customer }) {
  const { inAppMessagingData } = customer;

  if (!inAppMessagingData) {
    return null;
  }

  return (
    <Wrapper.Sidebar.Section>
      <h3>In app messaging</h3>
      <ul className="filters no-link">
        <li>
          Status
          <span className="counter">
            {
              inAppMessagingData.isActive
                ? <Label bsStyle="success">Online</Label>
                : <Label>Offline</Label>
            }
          </span>
        </li>
        <li>
          Last online
          <span className="counter">
            {moment(inAppMessagingData.lastSeenAt).fromNow()}
          </span>
        </li>
        <li>
          Session count
          <span className="counter">
            {inAppMessagingData.sessionCount}
          </span>
        </li>
      </ul>
    </Wrapper.Sidebar.Section>
  );
}

InAppMessagingSection.propTypes = propTypes;

export default InAppMessagingSection;
