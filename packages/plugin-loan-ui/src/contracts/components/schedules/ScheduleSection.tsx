import { __, Box, Icon, Alert, confirm } from '@erxes/ui/src';
import React from 'react';

import SchedulesList from '../../containers/Schedules';
import { ScrollTableColls } from '../../styles';

type Props = {
  contractId: string;
  isFirst: boolean;
  regenSchedules: (contractId: string) => void;
};

function ScheduleSection({ contractId, isFirst, regenSchedules }: Props) {
  const onRegenSchedules = () =>
    confirm()
      .then(() => regenSchedules(contractId))
      .catch(error => {
        Alert.error(error.message);
      });

  const renderExtraButton = () => {
    if (isFirst) {
      return <></>;
    }
    return (
      <button onClick={onRegenSchedules}>
        <Icon icon="refresh-1" />
      </button>
    );
  };

  return (
    <Box
      title={__(`${(isFirst && 'First ') || ''}Schedules`)}
      name="showSchedules"
      isOpen={!isFirst}
      extraButtons={renderExtraButton()}
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

export default ScheduleSection;
