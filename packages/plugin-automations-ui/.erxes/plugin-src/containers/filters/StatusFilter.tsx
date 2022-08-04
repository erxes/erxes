import React from 'react';
import { Counts } from '@erxes/ui/src/types';
import StatusFilter from '../../components/filters/StatusFilter';

type Props = {
  counts: Counts;
};

function StatusFilterContainer({ counts }: Props) {
  return <StatusFilter counts={counts || {}} />;
}

export default StatusFilterContainer;
