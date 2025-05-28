import React from 'react';
import { Tabs } from './PolarisList';
import { __ } from 'coreui/utils';
import { IContract } from '../types';
import PolarisSection from './PolarisSection';
import SavingActive from '../containers/ActiveContainer';

interface IProps {
  contract: IContract;
  savingHistories: any[];
  reSendContract: (data: any) => void;
  savingActive: (contractNumber: string) => void;
  sendDeposit: (data: any) => void;
  depositActive: (contractNumber: string) => void;
}

function PolarisData(props: IProps) {
  return (
    <Tabs
      tabs={[
        {
          label: __(`Sync Polaris`),
          component: <PolarisSection {...props} />
        },
        {
          label: __(`Active Saving contract`),
          component: <SavingActive {...props} />
        }
      ]}
    />
  );
}

export default PolarisData;
