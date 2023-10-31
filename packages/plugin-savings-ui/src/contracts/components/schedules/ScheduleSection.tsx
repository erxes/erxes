import { Box } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';

import SchedulesList from '../../containers/Schedules';
import { ScrollTableColls } from '../../styles';
import withConsumer from '../../../withConsumer';

type Props = {
  contractId: string;
  isFirst: boolean;
};

function ScheduleSection({ contractId, isFirst }: Props) {
  return (
    <Box title={__('Transactions')} name="showSchedules" isOpen={!isFirst}>
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
