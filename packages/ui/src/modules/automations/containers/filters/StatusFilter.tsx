import React from 'react';
import { Counts } from '../../types';
import StatusFilter from 'modules/automations/components/filters/StatusFilter';

type Props = {
  counts: Counts;
};

function StatusFilterContainer({ counts }: Props) {
  return <StatusFilter counts={counts || {}} />;
}

export default StatusFilterContainer;
