import { ClickableRow } from '@erxes/ui-contacts/src/customers/styles';
import { FlexContent } from '@erxes/ui-log/src/activityLogs/styles';
import FormControl from '@erxes/ui/src/components/form/Control';
import { ICompany } from '../../types';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import React from 'react';
import Tags from '@erxes/ui/src/components/Tags';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import _ from 'lodash';
import { formatValue } from '@erxes/ui/src/utils';

type Props = {
  index: number;
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

function displayValue(company, name, index) {
  const value = _.get(company, name);

  if (name === 'primaryName') {
    return (
      <FlexContent>
        <NameCard.Avatar company={company} size={30} /> &emsp;
        {formatValue(company.primaryName)}
      </FlexContent>
    );
  }

  if (name === 'code') {
    return <TextInfo>{value}</TextInfo>;
  }

  if (name.includes('customFieldsData')) {
    return displayObjectListItem(company, 'customFieldsData', name);
  }

  if (name === '#') {
    return <TextInfo>{index.toString()}</TextInfo>;
  }

  return formatValue(value);
}

function CompanyRow({
  company,
  columnsConfig,
  history,
  isChecked,
  toggleBulk,
  index
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
          <ClickableRow>{displayValue(company, name, index)}</ClickableRow>
        </td>
      ))}
      <td>
        <Tags tags={tags} limit={2} />
      </td>
    </tr>
  );
}

export default CompanyRow;
