import { IContractDoc } from '../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import LeftSidebar from './LeftSidebar';

import React from 'react';
import RightSidebar from './RightSidebar';
import ScheduleSection from '../schedules/ScheduleSection';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import { Tabs } from '../list/ContractForm';
import Polaris from '../polaris/index';
import { loadDynamicComponent } from '@erxes/ui/src/utils';

type Props = {
  contract: IContractDoc;
  currentUser: IUser;
  reSendContract: (data: any) => void;
  savingActive: (contractNumber: string) => void;
  sendDeposit: (data: any) => void;
  depositActive: (contractNumber: string) => void;
  loading: boolean;
};

const ContractDetails = (props: Props) => {
  const { contract, reSendContract, savingActive, sendDeposit, depositActive } =
    props;

  const title = contract.number || 'Unknown';

  const breadcrumb = [
    { title: __('Contracts'), link: '/erxes-plugin-saving/contract-list' },
    { title }
  ];

  const content = () => {
    let tabs = [
      {
        label: __(`Transactions`),
        component: (
          <ScheduleSection
            constractId={contract._id}
            constractNumber={contract.number}
          />
        )
      },
      {
        label: __(`Sync Polaris 2.0`),
        component: loadDynamicComponent(
          'savingPolarisSection',
          { contract },
          true
        )
      },
      {
        label: __(`Sync Polaris`),
        component: (
          <Polaris
            contract={contract}
            reSendContract={reSendContract}
            savingActive={savingActive}
            sendDeposit={sendDeposit}
            depositActive={depositActive}
          />
        )
      }
    ];

    return (
      <>
        <Tabs tabs={tabs} />
      </>
    );
  };

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      leftSidebar={<LeftSidebar {...props} />}
      rightSidebar={<RightSidebar contract={contract} />}
      content={content()}
      transparent={true}
    />
  );
};

export default ContractDetails;
