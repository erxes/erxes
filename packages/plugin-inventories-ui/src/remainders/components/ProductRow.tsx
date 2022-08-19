import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import { IRemainderProduct } from '../types';

type Props = {
  product: IRemainderProduct;
  history: any;
  isChecked: boolean;
  toggleBulk: (product: IRemainderProduct, isChecked?: boolean) => void;
};

const Row = (props: Props) => {
  const { product, toggleBulk, isChecked } = props;

  const { code, name, category, unitPrice, remainder, uom } = product;

  const onChange = (event: any) => {
    if (toggleBulk) {
      toggleBulk(product, event.target.checked);
    }
  };

  return (
    <tr>
      <td>
        <FormControl
          checked={isChecked}
          componentClass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{code}</td>
      <td>{name}</td>
      <td>{category ? category.name : ''}</td>
      <td>{(unitPrice || 0).toLocaleString()}</td>
      <td>{(remainder || 0).toLocaleString()}</td>
      <td>{(uom && uom.name) || ''}</td>
    </tr>
  );
};

export default Row;
