import React from 'react';
import { Tabs } from '../list/ContractForm';
import { __ } from 'coreui/utils';
import { IContract } from '../../types';
import PolarisSection from './PolarisSection';
import SavingActive from './SavingActive';

interface IProps {
  contract: IContract;
  reSendContract: (data: any) => void;
  savingActive: (contractNumber: string) => void;
}

function PolarisData(props: IProps) {
  return (
    <Tabs
      tabs={[
        {
          label: __(`Sync Polaris`),
          component: <PolarisSection {...props} />,
        },
        {
          label: __(`Active Saving contract`),
          component: <SavingActive {...props} />,
        },
      ]}
    />
  );
}

export default PolarisData;
