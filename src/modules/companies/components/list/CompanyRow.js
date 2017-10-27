import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import { Icon } from 'modules/common/components';

const propTypes = {
  company: PropTypes.object.isRequired,
  columnsConfig: PropTypes.array.isRequired
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

function CompanyRow({ company, columnsConfig }) {
  return (
    <tr>
      <td>
        <a href={`/companies/details/${company._id}`}>
          <Icon icon="log-in" />
        </a>
      </td>
      {columnsConfig.map(({ name }) => (
        <td key={name}>{formatValue(_.get(company, name))}</td>
      ))}
    </tr>
  );
}

CompanyRow.propTypes = propTypes;

export default CompanyRow;
