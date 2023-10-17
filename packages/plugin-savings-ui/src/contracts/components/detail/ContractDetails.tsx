import ActivityItem from './ActivityItem';
import { IContractDoc } from '../../types';
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

const ActivityInputs = asyncComponent(
  () =>
    isEnabled('logs') &&
    import(
      /* webpackChunkName: "ActivityInputs" */ '@erxes/ui-log/src/activityLogs/components/ActivityInputs'
    )
);

const ActivityLogs = asyncComponent(
  () =>
    isEnabled('logs') &&
    import(
      /* webpackChunkName: "ActivityLogs" */ '@erxes/ui-log/src/activityLogs/containers/ActivityLogs'
    )
);

type Props = {
  contract: IContractDoc;
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
        ? contract.collaterals.map(p => ({ ...p }))
        : [],
      // collecting data for ItemCounter component
      collaterals: contract.collaterals
        ? contract.collaterals.map(p => p.collateral)
        : []
    };
  }

  onChangeField = <T extends keyof State>(name: T, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
  };

  render() {
    const { contract } = this.props;

    const title = contract.number || 'Unknown';

    const breadcrumb = [
      { title: __('Contracts'), link: '/erxes-plugin-saving/contract-list' },
      { title }
    ];

    const content = (
      <>
        <ScheduleSection
          contractId={contract._id}
          isFirst={false}
        ></ScheduleSection>

        {isEnabled('logs') && (
          <>
            <ActivityInputs
              contentTypeId={contract._id}
              contentType="contract"
              showEmail={false}
            />
            <ActivityLogs
              target={contract.number || ''}
              contentId={contract._id}
              contentType="contract"
              extraTabs={[
                { name: 'plugin_invoices', label: 'Invoices / Transaction' }
              ]}
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
