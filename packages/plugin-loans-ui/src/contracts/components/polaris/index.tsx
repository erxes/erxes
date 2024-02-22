import React from 'react';
import { Tabs } from '../list/ContractForm';
import { __ } from 'coreui/utils';
import { IContract } from '../../types';
import LoanInfo from './LoanInfo';
import CollateralsInfo from './Collaterials';

interface IProps {
  contract: IContract;
}

function PolarisData(props: IProps) {
  return (
    <Tabs
      tabs={[
        {
          label: __(`Polaris Loan Detail`),
          component: <LoanInfo {...props} />,
        },
        {
          label: __(`Polaris Collaterals`),
          component: <CollateralsInfo {...props} />,
        },
      ]}
    />
  );
}

export default PolarisData;
