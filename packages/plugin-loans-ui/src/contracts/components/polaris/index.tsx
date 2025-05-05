import React from 'react';
import { Tabs } from '../list/ContractForm';
import { __ } from 'coreui/utils';
import { IContract } from '../../types';
import LoanInfo from './LoanInfo';
import CollateralsInfo from './Collaterials';
import PolarisSection from './PolarisSection';

interface IProps {
  contract: IContract;
  reSendContract: (data: any) => void;
}

function PolarisData(props: IProps) {
  return (
    <Tabs
      tabs={[
        {
          label: __(`Send Loan to Polaris`),
          component: <PolarisSection {...props} />,
        },
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
