import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';

const propTypes = {
  customer: PropTypes.object.isRequired,
  columnsConfig: PropTypes.array.isRequired,
  toggleBulk: PropTypes.func
};

function isTimeStamp(value) {
  if (typeof value === 'string') {
    value = parseInt(value, 10);
  }

  return (
    Number.isInteger(value) && value > 1000000000 && value <= 999999999999999
  );
}

function formatValue(value) {
  if (typeof value === 'boolean') {
    return value.toString();
  }

  if (
    value &&
    (moment(value, moment.ISO_8601).isValid() || isTimeStamp(value))
  ) {
    return moment(value).fromNow();
  }

  return value || 'N/A';
}

function CustomerRow({ customer, columnsConfig, toggleBulk }) {
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
        <a href={`customers/details/${customer._id}`}>
          <i className="ion-log-in" />
        </a>
      </td>
      {columnsConfig.map(({ name }) => (
        <td key={name}>{formatValue(_.get(customer, name))}</td>
      ))}
    </tr>
  );
}

CustomerRow.propTypes = propTypes;

export default CustomerRow;
