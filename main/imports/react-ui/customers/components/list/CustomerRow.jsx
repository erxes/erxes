import React from 'react';
import { Label } from 'react-bootstrap';
import moment from 'moment';
import { FlowRouter } from 'meteor/kadira:flow-router';


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
      <td>
        <a href={FlowRouter.path('customers/details', { id: customer._id })}>
          {customer.name}
        </a>
      </td>
      <td>{customer.email}</td>
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
