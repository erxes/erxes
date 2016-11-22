import React from 'react';
import { Label } from 'react-bootstrap';

const propTypes = {
  customer: React.PropTypes.object.isRequired,
};

function CustomerRow({ customer }) {
  const inAppMessagingData = customer.inAppMessagingData;
  const lastSeenAt = inAppMessagingData.lastSeenAt;

  return (
    <tr>
      <td>
        <a href="#">
          {customer.email}
        </a>
      </td>
      <td>{customer.brand() && customer.brand().name}</td>
      <td>{lastSeenAt && lastSeenAt.toDateString()}</td>
      <td>{inAppMessagingData.sessionCount}</td>
      <td>
        {
          inAppMessagingData.isActive ?
            <Label bsStyle="success">Active</Label> :
            <Label>Inactive</Label>
        }
      </td>
    </tr>
  );
}

CustomerRow.propTypes = propTypes;

export default CustomerRow;
