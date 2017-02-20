import React from 'react';
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
      <td className="less-space text-center">
        {
          inAppMessagingData.isActive
            ? <i className="ion-record text-success" />
            : <i className="ion-record text-muted" />
        }
      </td>
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
    </tr>
  );
}

CustomerRow.propTypes = propTypes;

export default CustomerRow;
