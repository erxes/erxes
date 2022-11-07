import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import StatusFilter from '../containers/filters/StatusFilter';
import { AutomationsCount } from '../types';

type Props = {
  counts: AutomationsCount;
};

function Sidebar({ counts }: Props) {
  return (
    <Wrapper.Sidebar hasBorder>
      <StatusFilter counts={counts.byStatus} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
