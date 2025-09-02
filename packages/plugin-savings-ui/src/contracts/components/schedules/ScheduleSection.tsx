import { Box } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';

import ActivityItem from '../detail/ActivityItem';
import SchedulesList from '../../containers/Schedules';
import { ScrollTableColls } from '../../styles';
import withConsumer from '../../../withConsumer';

import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { ITransaction } from '../../../transactions/types';

type Props = {
  contractId: string;
  contractNumber: string;
  transactions: ITransaction[];
};

const ActivityInputs = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ActivityInputs" */ '@erxes/ui-log/src/activityLogs/components/ActivityInputs'
    )
);

const ActivityLogs = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ActivityLogs" */ '@erxes/ui-log/src/activityLogs/containers/ActivityLogs'
    )
);

function ScheduleSection({ contractId, contractNumber, transactions }: Props) {
  return (
    <>
      <Box title={__('Transactions')} name="showSchedules" isOpen={true}>
        <ScrollTableColls>
          <SchedulesList
            contractId={contractId}
            transactions={transactions}
          ></SchedulesList>
        </ScrollTableColls>
      </Box>

      <>
        <ActivityInputs
          contentTypeId={contractId}
          contentType="savingContract"
          showEmail={false}
        />

        <ActivityLogs
          target={contractNumber || ''}
          contentId={contractId}
          contentType="savingContract"
          extraTabs={[
            { name: 'savings:interestStore', label: 'Interest store' }
          ]}
          activityRenderItem={ActivityItem}
        />
      </>
    </>
  );
}

export default withConsumer(ScheduleSection);
