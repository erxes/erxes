import _ from 'lodash';
import { __, FormControl, formatValue } from '@erxes/ui/src';
import React from 'react';
import { FlexItem } from '../../styles';
import { ICar, IProductCategory } from '../../types';
import { IConfigColumn } from '@erxes/ui-settings/src/properties/types';
import { ClickableRow } from '@erxes/ui-contacts/src/customers/styles';

type Props = {
  car: ICar;
  history: any;
  isChecked: boolean;
  toggleBulk: (car: ICar, isChecked?: boolean) => void;
  productCategories: IProductCategory[];
  product?: IProductCategory;
  columnsConfig: IConfigColumn[];
};

function displayValue(car, name) {
  const value = _.get(car, name);

  if (name === 'primaryName') {
    return <FlexItem>{formatValue(car.primaryName)}</FlexItem>;
  }

  return formatValue(value);
}

function CarRow({
  car = {} as ICar,
  history,
  isChecked,
  toggleBulk,
  columnsConfig,
  productCategories
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
    history.push(`/erxes-plugin-car/details/${car._id}`);
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
      {(columnsConfig || []).map(({ name }, index) => (
        <td key={index}>
          <ClickableRow onClick={onTdClick}>
            {displayValue(car, name)}
          </ClickableRow>
        </td>
      ))}
    </tr>
  );
}

export default CarRow;
