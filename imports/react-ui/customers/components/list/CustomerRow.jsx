import React from 'react';
import { Label } from 'react-bootstrap';
import moment from 'moment';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tags } from '/imports/react-ui/common';


const propTypes = {
  customer: React.PropTypes.object.isRequired,
};

function CustomerRow({ customer }) {
  const inAppMessagingData = customer.inAppMessagingData || {};
  const lastSeenAt = inAppMessagingData.lastSeenAt;
  const integration = customer.integration();
  const brand = customer.brand();
  const tags = customer.getTags();

  return (
    <tr>
      <td>
        <a href={FlowRouter.path('customers/details', { id: customer._id })}>
          {customer.name || '[no name]'}{' '}
          <Tags tags={tags} size="small" />
        </a>
      </td>
      <td>{customer.email || '[no email]'}</td>
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
