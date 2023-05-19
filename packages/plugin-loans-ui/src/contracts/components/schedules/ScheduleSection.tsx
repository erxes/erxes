import { __, Box, Icon, Alert, confirm } from '@erxes/ui/src';
import React from 'react';

import SchedulesList from '../../containers/Schedules';
import { ScrollTableColls } from '../../styles';
import withConsumer from '../../../withConsumer';
import { can } from '@erxes/ui/src/utils/core';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  contractId: string;
  isFirst: boolean;
  regenSchedules: (contractId: string) => void;
  fixSchedules?: (contractId: string) => void;
  hasTransaction?: boolean;
  currentUser: IUser;
};

function ScheduleSection({
  contractId,
  isFirst,
  regenSchedules,
  fixSchedules,
  hasTransaction,
  currentUser
}: Props) {
  const onRegenSchedules = () =>
    confirm('Are you sure Regenerate Schedule?')
      .then(() => regenSchedules(contractId))
      .catch(error => {
        Alert.error(error.message);
      });

  const onFixSchedules = () =>
    confirm('Are you sure Fix Schedule?')
      .then(() => fixSchedules && fixSchedules(contractId))
      .catch(error => {
        Alert.error(error.message);
      });

  const renderExtraButton = () => {
    if (isFirst) {
      return <></>;
    }

    if (hasTransaction)
      return (
        <button onClick={onFixSchedules} title={'fix schedule'}>
          <Icon icon="refresh-1" />
        </button>
      );

    return (
      <button onClick={onRegenSchedules} title="create schedule">
        <Icon icon="refresh-1" />
      </button>
    );
  };

  return (
    <Box
      title={__(`${(isFirst && 'First ') || ''}Schedules`)}
      name="showSchedules"
      isOpen={!isFirst}
      extraButtons={can('manageSchedule', currentUser) && renderExtraButton()}
    >
      <ScrollTableColls>
        <SchedulesList
          contractId={contractId}
          isFirst={isFirst}
        ></SchedulesList>
      </ScrollTableColls>
    </Box>
  );
}

export default withConsumer(ScheduleSection);
