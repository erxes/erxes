import { __ } from 'coreui/utils';
import React from 'react';

import SchedulesList from '../../containers/Schedules';
import { ScrollTableColls } from '../../styles';
import withConsumer from '../../../withConsumer';
import { IUser } from '@erxes/ui/src/auth/types';
import Box from '@erxes/ui/src/components/Box';
import Icon from '@erxes/ui/src/components/Icon';
import Alert from '@erxes/ui/src/utils/Alert';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import { can } from '@erxes/ui/src/utils/core';
import { IContract } from '../../types';

type Props = {
  contract: IContract;
  isFirst: boolean;
  regenSchedules: (contractId: string) => void;
  fixSchedules?: (contractId: string) => void;
  hasTransaction?: boolean;
  currentUser: IUser;
  leaseType?: string;
};

function ScheduleSection({
  contract,
  isFirst,
  leaseType,
  regenSchedules,
  fixSchedules,
  hasTransaction,
  currentUser,
}: Props) {

  const onRegenSchedules = () =>
    confirm(__('Are you sure Regenerate Schedule?'))
      .then(() => regenSchedules(contract._id))
      .catch((error) => {
        Alert.error(error.message);
      });

  const onFixSchedules = () =>
    confirm(__('Are you sure Fix Schedule?'))
      .then(() => fixSchedules && fixSchedules(contract._id))
      .catch((error) => {
        Alert.error(error.message);
      });

  const renderExtraButton = () => {
    if (contract.repayment !== 'custom') {
      if (isFirst) {
        return (
          <button onClick={onRegenSchedules} title="create schedule">
            <Icon icon="refresh-1" />
          </button>
        );
      }

      if (hasTransaction)
        return (
          <button onClick={onFixSchedules} title={'fix schedule'}>
            <Icon icon="refresh-1" />
          </button>
        );

      return (
        null
      );
    }
    return 

  };
  return (
    <Box
      title={__(`${(isFirst && 'First ') || ''}Schedules`)}
      name="showSchedules"
      isOpen={true}
      extraButtons={can('manageSchedule', currentUser) && renderExtraButton()}
    >
      <ScrollTableColls>
        <SchedulesList
          contractId={contract._id}
          isFirst={isFirst}
          leaseType={leaseType}
        ></SchedulesList>
      </ScrollTableColls>
    </Box>
  );
}

export default withConsumer(ScheduleSection);
