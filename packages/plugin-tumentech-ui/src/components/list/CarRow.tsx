import _ from 'lodash';
import { __, FormControl, formatValue } from '@erxes/ui/src';
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
};

function displayValue(car, name) {
  const value = _.get(car, name);

  if (name === 'primaryName') {
    return <FlexItem>{formatValue(car.primaryName)}</FlexItem>;
  }

  return formatValue(value);
}

function CarRow({
  car,
  history,
  isChecked,
  toggleBulk,
  productCategories
}: Props) {
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(car, e.target.checked);
    }
  };

  const onClick = (e) => {
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
      <td key={'plateNumber'} onClick={onTdClick}>
        {displayValue(car, 'plateNumber')}{' '}
      </td>
      <td key={'vinNumber'} onClick={onTdClick}>
        {displayValue(car, 'vinNumber')}
      </td>
      <td key={'vintageYear'} onClick={onTdClick}>
        {displayValue(car, 'vintageYear')}
      </td>
      <td key={'importYear'} onClick={onTdClick}>
        {displayValue(car, 'importYear')}
      </td>
      <td key={'description'} onClick={onTdClick}>
        {displayValue(car, 'description')}
      </td>
    </tr>
  );
}

export default CarRow;
