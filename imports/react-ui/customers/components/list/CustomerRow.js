import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tags } from '/imports/react-ui/common';

const propTypes = {
  customer: PropTypes.object.isRequired,
  customerFields: PropTypes.array.isRequired,
  toggleBulk: PropTypes.func.isRequired,
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

function CustomerRow({ customer, customerFields, toggleBulk }) {
  const onChange = e => {
    toggleBulk(customer, e.target.checked);
  };

  return (
    <tr>
      <td>
        <input type="checkbox" onChange={onChange} />
      </td>
      <td>
        <a href={FlowRouter.path('customers/details', { id: customer._id })}>
          <i className="ion-log-in" />
        </a>
      </td>
      {customerFields.map(({ key }) => (
        <td key={key}>
          {formatValue(_.get(customer, key))}
        </td>
      ))}
      <td>
        <Tags tags={customer.tags()} size="small" />
      </td>
    </tr>
  );
}

CustomerRow.propTypes = propTypes;

export default CustomerRow;
