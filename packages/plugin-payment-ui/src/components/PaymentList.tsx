import React from 'react';

import EmptyState from '@erxes/ui/src/components/EmptyState';
import Table from '@erxes/ui/src/components/table';
import { Count } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';

import { IPaymentDocument } from '../types';
import PaymentListItem from './PaymentListItem';

type Props = {
  payments: IPaymentDocument[];
  removePayment: (payment: IPaymentDocument, callback?: any) => void;
  queryParams: any;
  paymentsCount: number;
};

const IntegrationList: React.FC<Props> = (props) => {
  const {
    payments,
    queryParams: { _id },
    removePayment,
    paymentsCount,
  } = props;

  const renderRows = () => {
    return payments.map((payment) => (
      <PaymentListItem
        key={payment._id}
        _id={_id}
        payment={payment}
        removePayment={removePayment}
      />
    ));
  };

  if (!payments || payments.length < 1) {
    return (
      <EmptyState
        text="Start adding payments now!"
        image="/images/actions/2.svg"
      />
    );
  }

  return (
    <>
      <Count>
        {paymentsCount} config{paymentsCount > 1 && 's'}
      </Count>
      <Table>
        <thead>
          <tr>
            <th>{__('Name')}</th>
            <th>{__('Status')}</th>
            <th style={{ width: 130 }}>{__('Actions')}</th>
          </tr>
        </thead>
        <tbody>{renderRows()}</tbody>
      </Table>
    </>
  );
};

export default IntegrationList;
