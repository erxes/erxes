import StatusFilter from '../../components/StatusFilter';
import React from 'react';
import { Counts } from '../../types';

type Props = {
  counts: Counts;
};

function StatusFilterContainer({ counts }: Props) {
  return <StatusFilter counts={counts || {}} />;
}

export default StatusFilterContainer;
