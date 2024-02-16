import ActivityItem from './ActivityItem';
import CollateralsSection from './CollateralsSection';
import { IContractDoc, IInvoice } from '../../types';
import { IProduct } from '@erxes/ui-products/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import LeftSidebar from './LeftSidebar';
import React from 'react';
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

class ContractDetails extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const contract = props.contract;

    this.state = {
      amount: contract.amount || {},
      collateralsData: contract.collaterals
        ? contract.collaterals.map((p) => ({ ...p }))
        : [],
      // collecting data for ItemCounter component
      collaterals: contract.collaterals
        ? contract.collaterals.map((p) => p.collateral)
        : [],
    };
  }

  saveCollateralsData = () => {
    const { collateralsData } = this.state;
    const { saveItem, contract } = this.props;
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

    this.setState(
      { collateralsData: filteredCollateralsData, collaterals, amount },
      () => {
        saveItem({ ...contract, collateralsData });
      },
    );
  };

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  render() {
    const { contract, regenSchedules, fixSchedules } = this.props;

    const title = contract.number || 'Unknown';

    const breadcrumb = [
      { title: __('Contracts'), link: '/erxes-plugin-loan/contract-list' },
      { title },
    ];

    const pDataChange = (pData) => this.onChangeField('collateralsData', pData);
    const prsChange = (prs) => this.onChangeField('collaterals', prs);

    const content = (
      <>
        <Tabs
          tabs={[
            {
              label: __(`First Schedules`),
              component: (contract.leaseType === LEASE_TYPES.FINANCE ||
                contract.leaseType === LEASE_TYPES.SAVING) && (
                <ScheduleSection
                  contractId={contract._id}
                  isFirst={true}
                  regenSchedules={regenSchedules}
                  fixSchedules={fixSchedules}
                />
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
                  {...this.props}
                  onChangeCollateralsData={pDataChange}
                  onChangeCollaterals={prsChange}
                  saveCollateralsData={this.saveCollateralsData}
                  collateralsData={this.state.collateralsData}
                  collaterals={this.state.collaterals}
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
        leftSidebar={<LeftSidebar {...this.props} />}
        rightSidebar={<RightSidebar contract={contract} />}
        content={content}
        transparent={true}
      />
    );
  }
}

export default ContractDetails;
