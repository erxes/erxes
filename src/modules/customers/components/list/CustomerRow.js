import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import { FormControl, Tags } from 'modules/common/components';

const propTypes = {
  customer: PropTypes.object.isRequired,
  columnsConfig: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
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

function getVisitorInfo(customer, key) {
  if (
    (key === 'email' && !customer[key]) ||
    (key === 'phone' && !customer[key])
  ) {
    return customer.visitorContactInfo && customer.visitorContactInfo[key];
  }

  return _.get(customer, key);
}

function formatValue(value) {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (
    value &&
    (moment(value, moment.ISO_8601).isValid() || isTimeStamp(value))
  ) {
    return moment(value).fromNow();
  }

  return value || '-';
}

function CustomerRow({ customer, columnsConfig, toggleBulk, history }) {
  const tags = customer.getTags;
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(customer, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  return (
    <tr
      onClick={() => {
        history.push(`customers/details/${customer._id}`);
      }}
    >
      <td onClick={onClick}>
        <FormControl componentClass="checkbox" onChange={onChange} />
      </td>
      {columnsConfig.map(({ name }) => {
        return (
          <td key={name}>{formatValue(getVisitorInfo(customer, name))}</td>
        );
      })}
      <td>
        <Tags tags={tags} limit={2} />
      </td>
    </tr>
  );
}

CustomerRow.propTypes = propTypes;

export default CustomerRow;
