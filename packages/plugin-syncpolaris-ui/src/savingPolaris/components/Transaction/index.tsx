import React from 'react';
import { Tabs } from '../PolarisList';
import { __ } from 'coreui/utils';
import { IContract } from '../../types';
import TransactionContainer from '../../containers/Transaction';
import TransactionHistories from '../../containers/TransactionHistories';

interface IProps {
  contract: IContract;
  savingHistories: any[];
}

function PolarisData(props: IProps) {
  return (
    <Tabs
      tabs={[
        {
          label: __(`Transaction`),
          component: <TransactionContainer {...props} />
        },
        {
          label: __(`Sync Histories`),
          component: <TransactionHistories {...props} />
        }
      ]}
    />
  );
}

export default PolarisData;
