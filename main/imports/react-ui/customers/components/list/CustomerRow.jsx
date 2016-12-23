import React from 'react';
import { Label } from 'react-bootstrap';
import moment from 'moment';


const propTypes = {
  customer: React.PropTypes.object.isRequired,
};

function CustomerRow({ customer }) {
  const inAppMessagingData = customer.inAppMessagingData || {};
  const lastSeenAt = inAppMessagingData.lastSeenAt;
  const integration = customer.integration();
  const brand = customer.brand();

  return (
    <tr>
      <td>{customer.name}</td>
      <td>
        <a href="#">
          {customer.email}
        </a>
      </td>
      <td>{brand && brand.name}</td>
      <td>{integration && integration.name}</td>
      <td>{lastSeenAt && moment(lastSeenAt).fromNow()}</td>
      <td>{inAppMessagingData.sessionCount}</td>
      <td>
        {
          inAppMessagingData.isActive
            ? <Label bsStyle="success">Online</Label>
            : <Label>Offline</Label>
        }
      </td>
    </tr>
  );
}

CustomerRow.propTypes = propTypes;

export default CustomerRow;
