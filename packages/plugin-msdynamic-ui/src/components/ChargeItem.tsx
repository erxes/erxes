import React from 'react';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  item: any;
};

function ChargeItem(props: Props) {
  const { error, Document_No, Description, No, Quantity, Unit_Price } =
    props.item;

  return (
    <tr>
      <td>{Document_No || ''}</td>
      <td>{__(Description || '')}</td>
      <td>{No || ''}</td>
      <td>{Unit_Price || ''}</td>
      <td>{Quantity || ''}</td>
      <td>{error?.message || ''}</td>
    </tr>
  );
}

export default ChargeItem;
