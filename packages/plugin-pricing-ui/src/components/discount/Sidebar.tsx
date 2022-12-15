import React from 'react';
// erxes
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
// local
import StatusFilter from './filters/StatusFilter';

export default function Sidebar() {
  return (
    <Wrapper.Sidebar hasBorder>
      <StatusFilter />
    </Wrapper.Sidebar>
  );
}
