import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { mutations } from '@erxes/ui-cards/src/settings/boards/graphql';
import { Table } from 'react-bootstrap';

function LastExpensesForm() {
  return (
    <Table striped bordered>
      <thead>
        <tr>
          <th>#</th>
          <th>TYPE</th>
          <th> PRODUCT / SERVICE</th>
          <th> QUANTITY</th>
          <th> UNIT PRICE</th>
          <th> AMOUNT</th>
          <th> AFTER AMOUNT</th>
          <th>AFTER UNIT</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <th>option1</th>
          <th>baraa1</th>
          <th> 1</th>
          <th> 1412</th>
          <th> 5000</th>
          <th> 6000</th>
          <th>6000</th>
        </tr>
        <tr>
          <td>2</td>
          <th>option2</th>
          <th> baraa2</th>
          <th> 2</th>
          <th> 4899</th>
          <th> 6000</th>
          <th> 1450</th>
          <th>6000</th>
        </tr>
      </tbody>
    </Table>
  );
}

export default LastExpensesForm;
