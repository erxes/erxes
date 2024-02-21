import React from 'react';
import { Tabs } from '../list/ContractForm';
import { __ } from 'coreui/utils';
import { IContract } from '../../types';
import SavingInfo from './SavingInfo';
import TransactionsInfo from './TransactionsInfo';

interface IProps {
  contract: IContract;
}

function PolarisData(props: IProps) {
  return (
    <Tabs
      tabs={[
        {
          label: __(`Polaris Saving Balance`),
          component: <SavingInfo {...props} />,
        },
        {
          label: __(`Polaris Transaction`),
          component: <TransactionsInfo {...props} />,
        },
      ]}
    />
  );
}

export default PolarisData;
