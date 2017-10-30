import React from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button, Icon, FormControl } from 'modules/common/components';

const propTypes = {
  history: PropTypes.object.isRequired,
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

function CustomerRow({ history, customer, columnsConfig, toggleBulk }) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(customer, e.target.checked);
    }
  };

  return (
    <tr>
      <td>
        <FormControl componentClass="checkbox" onChange={onChange} />
      </td>
      {columnsConfig.map(({ name }) => (
        <td key={name} className={`table-field-${name}`}>
          {formatValue(_.get(customer, name))}
          {name === 'name' ? (
            <Button
              onClick={() => {
                history.push(`customers/details/${customer._id}`);
              }}
              iconKey
            >
              <Icon icon="eye" />
            </Button>
          ) : null}
        </td>
      ))}
    </tr>
  );
}

CustomerRow.propTypes = propTypes;

export default withRouter(CustomerRow);
