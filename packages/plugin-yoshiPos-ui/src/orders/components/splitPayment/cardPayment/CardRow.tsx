import React from 'react';

import { IPaymentInput } from 'modules/orders/types';

type Props = {
  item: IPaymentInput;
};

export default function CardRow({ item }: Props) {
  return (
    <tr key={item._id}>
      <td>{item.cardAmount}</td>
      <td>{item.cardInfo}</td>
    </tr>
  );
}
