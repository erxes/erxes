import _ from 'lodash';
import FormControl from 'modules/common/components/form/Control';
import NameCard from 'modules/common/components/nameCard/NameCard';
import Tags from 'modules/common/components/Tags';
import TextInfo from 'modules/common/components/TextInfo';
import { formatValue } from 'modules/common/utils';
import { ClickableRow } from 'modules/customers/styles';
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

function displayObjectListItem(company, customFieldName, subFieldName) {
  const objectList = company[customFieldName] || [];
  const subFieldKey = subFieldName.replace(`${customFieldName}.`, '');

  const subField = objectList.find
    ? objectList.find(obj => obj.field === subFieldKey)
    : [];

  if (!subField) {
    return null;
  }

  return formatValue(subField.value);
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

  if (name === 'code') {
    return <TextInfo>{value}</TextInfo>;
  }

  if (name.includes('customFieldsData')) {
    return displayObjectListItem(company, 'customFieldsData', name);
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
    history.push(`/companies/details/${company._id}`);
  };

  return (
    <tr onClick={onTrClick}>
      <td id="companiesCheckBox" onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      {columnsConfig.map(({ name }) => (
        <td key={name}>
          <ClickableRow>{displayValue(company, name)}</ClickableRow>
        </td>
      ))}
      <td>
        <Tags tags={tags} limit={2} />
      </td>
    </tr>
  );
}

export default CompanyRow;
