import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tags } from '/imports/react-ui/common';

const propTypes = {
  customer: PropTypes.object.isRequired,
  customerFields: PropTypes.array.isRequired,
};

function formatValue(value) {
  if (value && value instanceof Date) {
    return moment(value).fromNow();
  }

  if (typeof value === 'boolean') {
    return value.toString();
  }

  return value || 'N/A';
}

function CustomerRow({ customer, customerFields }) {
  return (
    <tr>
      {customerFields.map(({ key }, index) => (
        <td key={key}>
          {index > 0
            ? formatValue(_.get(customer, key))
            : <a href={FlowRouter.path('customers/details', { id: customer._id })}>
                {formatValue(_.get(customer, key))}
              </a>}
        </td>
      ))}
      <td>
        <Tags tags={customer.getTags()} size="small" />
      </td>
    </tr>
  );
}

CustomerRow.propTypes = propTypes;

export default CustomerRow;
