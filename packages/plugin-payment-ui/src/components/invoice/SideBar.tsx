import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { Counts } from '@erxes/ui/src/types';

import React from 'react';

import StatusFilter from '../filters/StatusFilter';
import KindFilter from '../filters/KindFilter';

type Props = {
  counts: {
    byKind: Counts;
    byStatus: Counts;
  };
};

function Sidebar({ counts }: Props) {
  return (
    <Wrapper.Sidebar hasBorder={true}>
      <StatusFilter counts={counts.byStatus} />
      <KindFilter counts={counts.byKind} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
