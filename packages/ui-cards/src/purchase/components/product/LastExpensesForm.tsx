import { Alert, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Table from '@erxes/ui/src/components/table';

function LastExpensesForm({ productsData }) {
  return (
    <Table whiteSpace="nowrap" hover={true}>
      <thead>
        <tr>
          <th>{__('PRODUCT / SERVICE')}</th>
          <th>{__('QUANTITY')}</th>
          <th>{__('AMOUNT')}</th>
          <th>{__('UNIT PRICE')}</th>
          <th>{__('AFTER AMOUNT')}</th>
        </tr>
      </thead>
      <tbody>
        {productsData.map((item, key) => {
          return (
            <tr key={key}>
              <td>{item.product.name}</td>
              <td>{item.quantity}</td>
              <td>{item.amount}</td>
              <td>{item.unitPrice}</td>
              <td>{item.costPrice.toFixed(3)}</td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default LastExpensesForm;
