import React from 'react';
import { __ } from 'coreui/utils';
import { IContract } from '../../types';
import TransactionContainer from '../../containers/Transaction';
import TransactionHistories from '../../containers/TransactionHistories';
import { Tabs } from '..';

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
