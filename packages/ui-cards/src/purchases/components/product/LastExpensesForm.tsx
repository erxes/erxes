import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Table from '@erxes/ui/src/components/table';

function LastExpensesForm({ costPriceQuery }) {
  return (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('PRODUCT / SERVICE')}</th>
          <th>{__('QUANTITY')}</th>
          <th>{__('AMOUNT')}</th>
          <th>{__('UNIT PRICE')}</th>
          <th>{__('EXPENSE')}</th>
          <th>{__('AMOUNT WITH EXPENSE')}</th>
        </tr>
      </thead>
      <tbody>
        {costPriceQuery.map((item, key) => {
          return (
            <tr key={key}>
              <td>{item.product.name}</td>
              <td>{item.quantity}</td>
              <td>{item.amount}</td>
              <td>{item.unitPrice}</td>
              <td>{item.costPrice}</td>
              <td>{item.amount + item.costPrice}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default LastExpensesForm;
