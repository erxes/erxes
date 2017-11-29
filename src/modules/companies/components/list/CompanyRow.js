import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';

const propTypes = {
  company: PropTypes.object.isRequired,
  columnsConfig: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired
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

function CompanyRow({ company, columnsConfig, history }) {
  return (
    <tr
      onClick={() => {
        history.push(`companies/details/${company._id}`);
      }}
    >
      {columnsConfig.map(({ name }) => (
        <td key={name}>{formatValue(_.get(company, name))}</td>
      ))}
    </tr>
  );
}

CompanyRow.propTypes = propTypes;

export default CompanyRow;
