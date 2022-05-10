import React from 'react';

import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Structure from '../containers/structure/Box';
import DepartmentList from '../containers/department/List';
import UnitList from '../containers/unit/List';
import BranchList from '../containers/branch/List';
import SegmentFilter from '../containers/filters/SegmentFilter';
import { isEnabled } from '@erxes/ui/src/utils/core';

export default function LeftSidebar({
  loadingMainQuery
}: {
  loadingMainQuery: boolean;
  hasBorder?: boolean;
}) {
  return (
    <Sidebar noMargin={true} hasBorder={true}>
      <Structure />
      <DepartmentList />
      {isEnabled('segments') && (
        <SegmentFilter loadingMainQuery={loadingMainQuery} />
      )}
      <UnitList />
      <BranchList />
    </Sidebar>
  );
}
