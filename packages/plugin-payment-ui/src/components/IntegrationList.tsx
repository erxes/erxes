import {
  IIntegration,
  IntegrationMutationVariables
} from '@erxes/ui-inbox/src/settings/integrations/types';

import { Count } from '@erxes/ui/src/styles/main';
import { EMPTY_CONTENT_MESSENGER } from '@erxes/ui-settings/src/constants';
import EmptyContent from '@erxes/ui/src/components/empty/EmptyContent';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import { INTEGRATION_KINDS } from '@erxes/ui/src/constants/integrations';
import IntegrationListItem from './IntegrationListItem';
import React from 'react';
import Table from '@erxes/ui/src/components/table';
import { __ } from '@erxes/ui/src/utils';
import { IPaymentConfig, IPaymentConfigDocument } from '../types';

type Props = {
  paymentConfigs: IPaymentConfigDocument[];
  removePaymentConfig: (
    paymentConfig: IPaymentConfigDocument,
    callback?: any
  ) => void;

  // archive: (id: string, status: boolean) => void;
  // editPaymentConfig: (
  //   id: string,
  //   { name, config }: IPaymentConfigVariables
  // ) => void;
  queryParams: any;
  integrationsCount: number;
};

class IntegrationList extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    console.log('list component test ...');
  }

  renderRows() {
    const {
      paymentConfigs,
      queryParams: { _id },
      removePaymentConfig
    } = this.props;

    return paymentConfigs.map(i => (
      <IntegrationListItem
        key={i._id}
        _id={_id}
        paymentConfig={i}
        removePaymentConfig={removePaymentConfig}
        // editPaymentConfig={editPaymentConfig}
        // archive={archive}
        // disableAction={disableAction}
        // editIntegration={editIntegration}
      />
    ));
  }

  render() {
    const { paymentConfigs, integrationsCount } = this.props;

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
          {integrationsCount} config{integrationsCount > 1 && 's'}
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
