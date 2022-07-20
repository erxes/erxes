import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import StatusFilter from '@erxes/ui-leads/src/containers/filters/StatusFilter';
import { Counts } from '@erxes/ui/src/types';

type Props = {
  counts: {
    byStatus: Counts;
  };
};

function Sidebar({ counts }: Props) {
  return (
    <Wrapper.Sidebar>
      <StatusFilter counts={counts.byStatus} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
