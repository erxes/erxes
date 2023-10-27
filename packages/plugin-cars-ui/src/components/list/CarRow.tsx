import _ from 'lodash';
import { FormControl, formatValue } from '@erxes/ui/src';
import React from 'react';
import { FlexItem } from '../../styles';
import { ICar } from '../../types';

type Props = {
  car: ICar;
  history: any;
  isChecked: boolean;
  toggleBulk: (car: ICar, isChecked?: boolean) => void;
};

function displayValue(car, name) {
  const value = _.get(car, name);

  if (name === 'primaryName') {
    return <FlexItem>{formatValue(car.primaryName)}</FlexItem>;
  }

  return formatValue(value);
}

function CarRow({ car, history, isChecked, toggleBulk }: Props) {
  const onChange = e => {
    if (toggleBulk) {
      toggleBulk(car, e.target.checked);
    }
  };

  const onClick = e => {
    e.stopPropagation();
  };

  const onTrClick = () => {
    history.push(`/erxes-plugin-car/details/${car._id}`);
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

      <td key={'plateNumber'}>{displayValue(car, 'plateNumber')} </td>
      <td key={'vinNumber'}>{displayValue(car, 'vinNumber')}</td>
      <td key={'vintageYear'}>{displayValue(car, 'vintageYear')}</td>
      <td key={'importYear'}>{displayValue(car, 'importYear')}</td>
      <td key={'description'}>{displayValue(car, 'description')}</td>
    </tr>
  );
}

export default CarRow;
