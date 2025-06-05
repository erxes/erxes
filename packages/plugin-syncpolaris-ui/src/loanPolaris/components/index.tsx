import React from 'react';
import { __ } from 'coreui/utils';
import { Tabs as MainTabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { IContract } from '../types';
import LoanInfo from './LoanInfo';
import CollateralsInfo from './Collaterials';
import PolarisSection from './PolarisSection';
import ScheduleSection from './ScheduleSection';
import ActiveContainer from '../containers/ActiveContainer';
import Collateral from '../containers/Collateral';

interface IProps {
  contract: IContract;
  savingHistories: any[];
  reSendContract: (data: any) => void;
  reSendCollateral: (data: any) => void;
  reSendSchedules: (data: any) => void;
  activeLoan: (contractNumber: string) => void;
}

interface ITabItem {
  component: any;
  label: string;
}

interface ITabs {
  tabs: ITabItem[];
}

export const Tabs = ({ tabs }: ITabs) => {
  const [tabIndex, setTabIndex] = React.useState(0);

  return (
    <>
      <MainTabs>
        {tabs.map((tab, index) => (
          <TabTitle
            className={tabIndex === index ? 'active' : ''}
            key={`tab${tab.label}`}
            onClick={() => setTabIndex(index)}
          >
            {tab.label}
          </TabTitle>
        ))}
      </MainTabs>

      <div style={{ width: '100%', marginTop: 20 }}>
        {tabs?.[tabIndex]?.component}
      </div>
    </>
  );
};

function PolarisData(props: IProps) {
  return (
    <Tabs
      tabs={[
        {
          label: __(`Send Loan to Polaris`),
          component: <PolarisSection {...props} />
        },
        {
          label: __(`Sync schedule`),
          component: <ScheduleSection {...props} />
        },
        {
          label: __(`Sync Collateral`),
          component: <Collateral {...props} />
        },
        {
          label: __(`Active Loan contract`),
          component: <ActiveContainer {...props} />
        },
        {
          label: __(`Polaris Loan Detail`),
          component: <LoanInfo {...props} />
        },
        {
          label: __(`Polaris Collaterals`),
          component: <CollateralsInfo {...props} />
        }
      ]}
    />
  );
}

export default PolarisData;
