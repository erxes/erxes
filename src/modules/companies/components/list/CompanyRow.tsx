import _ from 'lodash';
import { FormControl, NameCard, Tags } from 'modules/common/components';
import { isTimeStamp, urlParser } from 'modules/common/utils';
import { Date } from 'modules/customers/styles';
import moment from 'moment';
import React from 'react';
import { FlexItem } from '../../styles';
import { ICompany } from '../../types';

type Props = {
  company: ICompany;
  columnsConfig: any[];
  history: any;
  isChecked: boolean;
  toggleBulk: (company: ICompany, isChecked?: boolean) => void;
};

function createLinkFromUrl(url) {
  if (!url.includes('http')) {
    url = 'http://' + url;
  }

  const onClick = e => {
    e.stopPropagation();
    window.open(url);
  };

  return (
    <a href="#link" onClick={onClick}>
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
    return <Date>{moment(value).format('lll')}</Date>;
  }

  return value || '-';
}

function displayValue(company, name) {
  const value = _.get(company, name);

  if (name === 'primaryName') {
    return (
      <FlexItem>
        <NameCard.Avatar company={company} size={30} /> &emsp;
        {formatValue(company.primaryName)}
      </FlexItem>
    );
  }

  return formatValue(value);
}

function CompanyRow({
  company,
  columnsConfig,
  history,
  isChecked,
  toggleBulk
}: Props) {
  const tags = company.getTags || [];

  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(company, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    history.push(`/contacts/companies/details/${company._id}`);
  };

  return (
    <tr onClick={onTrClick}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      {columnsConfig.map(({ name }) => (
        <td key={name}>{displayValue(company, name)}</td>
      ))}
      <td>
        <Tags tags={tags} limit={2} />
      </td>
    </tr>
  );
}

export default CompanyRow;
