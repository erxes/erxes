import { Box } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';

import SchedulesList from '../../containers/Schedules';
import { ScrollTableColls } from '../../styles';
import withConsumer from '../../../withConsumer';

type Props = {
  isFirst: boolean;
};

function ScheduleSection({ isFirst }: Props) {
  return (
    <Box title={__('Transactions')} name="showSchedules" isOpen={!isFirst}>
      <ScrollTableColls>
        <SchedulesList
          isFirst={isFirst}
        ></SchedulesList>
      </ScrollTableColls>
    </Box>
  );
}

export default withConsumer(ScheduleSection);
