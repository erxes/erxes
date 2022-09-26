import React from 'react';

import EmptyState from '@erxes/ui/src/components/EmptyState';
import Table from '@erxes/ui/src/components/table';
import { Count } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';

import { IPaymentConfigDocument } from '../types';
import PaymentConfigListItem from './PaymentConfigListItem';

type Props = {
  paymentConfigs: IPaymentConfigDocument[];
  removePaymentConfig: (
    paymentConfig: IPaymentConfigDocument,
    callback?: any
  ) => void;
  queryParams: any;
  paymentConfigsCount: number;
};

class IntegrationList extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  renderRows() {
    const {
      paymentConfigs,
      queryParams: { _id },
      removePaymentConfig
    } = this.props;

    return paymentConfigs.map(paymentConfig => (
      <PaymentConfigListItem
        key={paymentConfig._id}
        _id={_id}
        paymentConfig={paymentConfig}
        removePaymentConfig={removePaymentConfig}
      />
    ));
  }

  render() {
    const { paymentConfigs, paymentConfigsCount } = this.props;

    if (!paymentConfigs || paymentConfigs.length < 1) {
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
          {paymentConfigsCount} config{paymentConfigsCount > 1 && 's'}
        </Count>
        <Table>
          <thead>
            <tr>
              <th>{__('Name')}</th>
              <th>{__('Status')}</th>
              <th style={{ width: 130 }}>{__('Actions')}</th>
            </tr>
          </thead>
          <tbody>{this.renderRows()}</tbody>
        </Table>
      </>
    );
  }
}

export default IntegrationList;
