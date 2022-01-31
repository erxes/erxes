import React from 'react';

import Sidebar from 'modules/layout/components/Sidebar';
import Structure from '../containers/structure/Box';
import DepartmentList from '../containers/department/List';
import UnitList from '../containers/unit/List';
import BranchList from '../containers/branch/List';
import SegmentFilter from '../containers/filters/SegmentFilter';

export default function LeftSidebar({
  loadingMainQuery
}: {
  loadingMainQuery: boolean;
}) {
  return (
    <Sidebar>
      <Structure />
      <DepartmentList />
      <SegmentFilter loadingMainQuery={loadingMainQuery} />
      <UnitList />
      <BranchList />
    </Sidebar>
  );
}
