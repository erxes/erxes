import React from 'react';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  item: any;
};

function ChargeItem(props: Props) {
  const { error, Document_No, Description, No, Quantity } = props.item;

  return (
    <tr>
      <td>{error?.message || ''}</td>
      <td>{Document_No || ''}</td>
      <td>{__(Description || '')}</td>
      <td>{No || ''}</td>
      <td>{Quantity || ''}</td>
    </tr>
  );
}

export default ChargeItem;
