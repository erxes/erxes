import { __ } from 'coreui/utils';
import React from 'react';

import SchedulesList from '../../containers/Schedules';
import { ScrollTableColls } from '../../styles';
import withConsumer from '../../../withConsumer';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  contractId: string;
  isFirst: boolean;
  regenSchedules: (contractId: string) => void;
  fixSchedules?: (contractId: string) => void;
  hasTransaction?: boolean;
  currentUser: IUser;
  leaseType?: string;
};

function ScheduleSection({ contractId, isFirst, leaseType }: Props) {
  return (
    <ScrollTableColls>
      <SchedulesList
        contractId={contractId}
        isFirst={isFirst}
        leaseType={leaseType}
      ></SchedulesList>
    </ScrollTableColls>
  );
}

export default withConsumer(ScheduleSection);
