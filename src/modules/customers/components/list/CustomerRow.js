import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button, Icon, FormControl } from 'modules/common/components';
import { TagItem } from '../styles';

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

function renderTags(tags) {
  if (!tags.length) {
    return null;
  }

  return tags.map(({ _id, colorCode, name }) => (
    <TagItem key={_id} style={{ backgroundColor: colorCode }}>
      {name}
    </TagItem>
  ));
}

function CustomerRow({ history, customer, columnsConfig, toggleBulk }) {
  const tags = customer.getTags;
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
          {name === 'name' ? (
            <div>
              <Link to={`customers/details/${customer._id}`}>
                {formatValue(_.get(customer, name))}
              </Link>
              <Button
                onClick={() => {
                  history.push(`customers/details/${customer._id}`);
                }}
                iconKey
              >
                <Icon icon="eye" />
              </Button>
            </div>
          ) : (
            formatValue(_.get(customer, name))
          )}
        </td>
      ))}
      <td>{renderTags(tags)}</td>
    </tr>
  );
}

CustomerRow.propTypes = propTypes;

export default withRouter(CustomerRow);
