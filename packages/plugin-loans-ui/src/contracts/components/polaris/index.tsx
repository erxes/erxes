import React from 'react';
import { Tabs } from '../list/ContractForm';
import { __ } from 'coreui/utils';
import { IContract } from '../../types';
import LoanInfo from './LoanInfo';
import CollateralsInfo from './Collaterials';
import PolarisSection from './PolarisSection';
import ScheduleSection from './ScheduleSection';
import LoanActive from './LoanActive';
import CollateralSection from './CollateralSection';

interface IProps {
  contract: IContract;
  reSendContract: (data: any) => void;
  reSendCollateral: (contract: any) => void;
  reSendSchedules: (contract: any) => void;
  activeLoan: (contractNumber: string) => void;
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
          label: __(`Sync schedule`),
          component: <ScheduleSection {...props} />,
        },
        {
          label: __(`Sync Collateral`),
          component: <CollateralSection {...props} />,
        },
        {
          label: __(`Active Loan contract`),
          component: <LoanActive {...props} />,
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
