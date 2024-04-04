import Table from '@erxes/ui/src/components/table';
import React from 'react';
import { IRate } from '../../../types';

const List = (props: { rates: IRate[] }) => {
  const rates = props.rates.filter(rate => rate.currency !== 'MNT');
  return (
    <Table>
      <thead>
        <tr>
          <th>Currency</th>
          <th>Buy</th>
          <th>Sell</th>
        </tr>
      </thead>
      <tbody>
        {rates.map(rate => (
          <tr key={rate.number}>
            <td>{rate.currency}</td>
            <td>{rate.buyRate.toLocaleString()}</td>
            <td>{rate.sellRate.toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default List;
