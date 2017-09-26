import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Tags } from '/imports/react-ui/common';

const propTypes = {
  customer: PropTypes.object.isRequired,
  customerFields: PropTypes.array.isRequired,
  toggleBulk: PropTypes.func,
};

function isTimeStamp(value) {
  if (typeof value === 'string') {
    value = parseInt(value);
  }

  return Number.isInteger(value) && value > 1000000000 && value <= 999999999999999;
}

function formatValue(value) {
  if (typeof value === 'boolean') {
    return value.toString();
  }

  if (value && (moment(value, moment.ISO_8601).isValid() || isTimeStamp(value))) {
    return moment(value).fromNow();
  }

  return value || 'N/A';
}

function CustomerRow({ customer, customerFields, toggleBulk }) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(customer, e.target.checked);
    }
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
      {customerFields.map(({ key }) => <td key={key}>{formatValue(_.get(customer, key))}</td>)}
      <td>
        <Tags tags={customer.getTags} size="small" />
      </td>
    </tr>
  );
}

CustomerRow.propTypes = propTypes;

export default CustomerRow;
