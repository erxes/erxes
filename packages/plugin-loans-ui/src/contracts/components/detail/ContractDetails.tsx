import ActivityItem from './ActivityItem';
import CollateralsSection from './CollateralsSection';
import { IContractDoc, IInvoice } from '../../types';
import { IProduct } from '@erxes/ui-products/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import LeftSidebar from './LeftSidebar';
import React, { useEffect, useState } from 'react';
import RightSidebar from './RightSidebar';
import ScheduleSection from '../schedules/ScheduleSection';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { LEASE_TYPES } from '../../../contractTypes/constants';
import { Tabs } from '../list/ContractForm';
import InvoiceList from '../invoices/InvoiceList';
import StoreInterestSection from '../storeInterest/StoreInterestSection';
import TransactionSection from '../transaction/TransactionSection';
import { ITransaction } from '../../../transactions/types';

const ActivityInputs = asyncComponent(
  () =>
    isEnabled('logs') &&
    import(
      /* webpackChunkName: "ActivityInputs" */ '@erxes/ui-log/src/activityLogs/components/ActivityInputs'
    ),
);

const ActivityLogs = asyncComponent(
  () =>
    isEnabled('logs') &&
    import(
      /* webpackChunkName: "ActivityLogs" */ '@erxes/ui-log/src/activityLogs/containers/ActivityLogs'
    ),
);

type Props = {
  contract: IContractDoc & {
    invoices: IInvoice[];
    loanTransactionHistory: ITransaction[];
    amount?: any;
    collaterals?: any;
    storeInterest?: any;
  };
  currentUser: IUser;
  saveItem: (doc: IContractDoc, callback?: (item) => void) => void;
  regenSchedules: (contractId: string) => void;
  fixSchedules: (contractId: string) => void;
  loading: boolean;
};

type State = {
  amount: any;
  collaterals: IProduct[];
  collateralsData: any;
};

const ContractDetails = (props: Props) => {
  const { saveItem, contract } = props;
  const [amount, setAmount] = useState(contract.amount || {});
  const [collateralsData, setCollateralsData] = useState(
    contract.collaterals ? contract.collaterals.map((p) => ({ ...p })) : [],
  );
  const [collaterals, setCollaterals] = useState(
    contract.collaterals ? contract.collaterals.map((p) => p.collateral) : [],
  );

  useEffect(() => {
    saveItem({ ...contract, collateralsData });
  }, [amount, collaterals, collateralsData]);

  const saveCollateralsData = () => {
    const collaterals: IProduct[] = [];
    const amount: any = {};
    const filteredCollateralsData: any = [];

    collateralsData.forEach((data) => {
      // collaterals
      if (data.collateral) {
        if (data.currency) {
          // calculating item amount
          if (!amount[data.currency]) {
            amount[data.currency] = data.amount || 0;
          } else {
            amount[data.currency] += data.amount || 0;
          }
        }
        // collecting data for ItemCounter component
        collaterals.push(data.collateral);
        data.collateralId = data.collateral._id;
        filteredCollateralsData.push(data);
      }
    });
    setCollateralsData(filteredCollateralsData);
    setCollaterals(collaterals);
    setAmount(amount);
  };

  const onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    if (name === 'collaterals') {
      setCollaterals(value);
    }
    if (name === 'collateralsData') {
      setCollateralsData(value);
    }
  };

  const title = contract.number || 'Unknown';

  const breadcrumb = [
    { title: __('Contracts'), link: '/erxes-plugin-loan/contract-list' },
    { title },
  ];

  const pDataChange = (pData) => onChangeField('collateralsData', pData);
  const prsChange = (prs) => onChangeField('collaterals', prs);
  console.log('contract', contract, collaterals, collateralsData);
  const content = (
    <>
      <Tabs
        tabs={[
          {
            label: __(`First Schedules`),
            component: (contract.leaseType === LEASE_TYPES.FINANCE ||
              contract.leaseType === LEASE_TYPES.SAVING) && (
              <ScheduleSection contractId={contract._id} isFirst={true} />
            ),
          },
          {
            label: __(`Schedules`),
            component: (
              <ScheduleSection contractId={contract._id} isFirst={false} />
            ),
          },
          {
            label: __(`Invoice`),
            component: <InvoiceList invoices={contract.invoices} />,
          },
          {
            label: __(`Transaction`),
            component: (
              <TransactionSection
                contractId={contract._id}
                transactions={contract.loanTransactionHistory}
              />
            ),
          },
          {
            label: __('Interest store'),
            component: (
              <StoreInterestSection invoices={contract.storeInterest} />
            ),
          },

          {
            label: __('Collaterals'),
            component: (
              <CollateralsSection
                {...props}
                onChangeCollateralsData={pDataChange}
                onChangeCollaterals={prsChange}
                saveCollateralsData={saveCollateralsData}
                collateralsData={collateralsData}
                collaterals={collaterals}
                contractId={contract._id}
              ></CollateralsSection>
            ),
          },
        ]}
      />

      {isEnabled('logs') && (
        <>
          <ActivityInputs
            contentTypeId={contract._id}
            contentType="loans:contract"
            showEmail={false}
          />
          <ActivityLogs
            target={contract.number || ''}
            contentId={contract._id}
            contentType="loans:contract"
            extraTabs={[]}
            activityRenderItem={ActivityItem}
          />
        </>
      )}
    </>
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={title} breadcrumb={breadcrumb} />}
      leftSidebar={<LeftSidebar {...props} />}
      rightSidebar={<RightSidebar contract={contract} />}
      content={content}
      transparent={true}
    />
  );
};

export default ContractDetails;
