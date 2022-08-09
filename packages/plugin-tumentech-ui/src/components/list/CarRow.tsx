import { formatValue } from '@erxes/ui/src/utils';
import TextInfo from '@erxes/ui/src/components/TextInfo';
import FormControl from '@erxes/ui/src/components/form/Control';
import { __ } from '@erxes/ui/src/utils/core';
import { ICar, IProductCategory } from '../../types';

import { ClickableRow } from '@erxes/ui-contacts/src/customers/styles';
import { FlexItem } from '../../styles';
import { IConfigColumn } from '@erxes/ui-forms/src/settings/properties/types';
import React from 'react';
import _ from 'lodash';

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
  const value = _.get(car, name);

  if (name === 'primaryName') {
    return <FlexItem>{formatValue(car.primaryName)}</FlexItem>;
  }

  if (name === '#') {
    return <TextInfo>{index.toString()}</TextInfo>;
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
