import { ClickableRow } from '@erxes/ui-contacts/src/customers/styles';
import { IConfigColumn } from '@erxes/ui-forms/src/settings/properties/types';
import FormControl from '@erxes/ui/src/components/form/Control';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import { formatValue } from '@erxes/ui/src/utils';
import { renderFullName } from '@erxes/ui/src/utils/core';
import _ from 'lodash';
import React from 'react';

import { FlexItem } from '../../styles';
import { ICar, IProductCategory } from '../../types';

type Props = {
  car: ICar;
  history: any;
  isChecked: boolean;
  toggleBulk: (car: ICar, isChecked?: boolean) => void;
  productCategories: IProductCategory[];
  product?: IProductCategory;
  columnsConfig: IConfigColumn[];
  index: number;
};

function displayValue(car, name, index) {
  let value = _.get(car, name);

  if (name === 'primaryName') {
    return <FlexItem>{formatValue(car.primaryName)}</FlexItem>;
  }

  if (name === '#') {
    value = index.toString();
  }

  if (name === 'drivers') {
    return car.customers && car.customers.length
      ? car.customers.map(driver => (
          <li>
            <TextInfo>{driver ? renderFullName(driver) : '-'}</TextInfo>
          </li>
        ))
      : '-';
  }

  if (name === 'companies') {
    return car.companies && car.companies.length
      ? car.companies.map(company => (
          <li>
            <TextInfo>{company ? company.primaryName : '-'}</TextInfo>
          </li>
        ))
      : '-';
  }

  if (name === 'category') {
    value = car.category ? car.category.name : '-';
  }

  if (name === 'parentCategory') {
    value = car.parentCategory ? car.parentCategory.name : '-';
  }

  return formatValue(value);
}

function CarRow({
  car = {} as ICar,
  history,
  isChecked,
  toggleBulk,
  columnsConfig,
  index
}: Props) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(car, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  const onTdClick = () => {
    history.push(`/erxes-plugin-tumentech/car/details/${car._id}`);
  };

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      {(columnsConfig || []).map(({ name }, i) => (
        <td key={i}>
          <ClickableRow onClick={onTdClick}>
            {displayValue(car, name, index)}
          </ClickableRow>
        </td>
      ))}
    </tr>
  );
}

export default CarRow;
