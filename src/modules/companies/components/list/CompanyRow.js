import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import { FormControl, Tags } from 'modules/common/components';
import { urlParser } from 'modules/common/utils';

const propTypes = {
  company: PropTypes.object.isRequired,
  columnsConfig: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  isChecked: PropTypes.bool,
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

function createLinkFromUrl(url) {
  if (!url.includes('http')) url = 'http://' + url;
  return (
    <a
      onClick={e => {
        e.stopPropagation();
        window.open(url);
      }}
    >
      {urlParser.extractRootDomain(url)}
    </a>
  );
}

function formatValue(value) {
  if (typeof value === 'boolean') {
    return value.toString();
  }

  if (urlParser.isValidURL(value)) {
    return createLinkFromUrl(value);
  }

  if (
    value &&
    (moment(value, moment.ISO_8601).isValid() || isTimeStamp(value))
  ) {
    return moment(value).fromNow();
  }

  return value || '-';
}

function CompanyRow({
  company,
  columnsConfig,
  history,
  isChecked,
  toggleBulk
}) {
  const tags = company.getTags || [];

  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(company, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };
  return (
    <tr
      onClick={() => {
        history.push(`companies/details/${company._id}`);
      }}
    >
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      {columnsConfig.map(({ name }) => (
        <td key={name}>{formatValue(_.get(company, name))}</td>
      ))}
      <td>
        <Tags tags={tags} limit={2} />
      </td>
    </tr>
  );
}

CompanyRow.propTypes = propTypes;

export default CompanyRow;
