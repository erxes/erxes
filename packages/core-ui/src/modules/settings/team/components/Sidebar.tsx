import BranchList from '../containers/branch/List';
import DepartmentList from '../containers/department/List';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import Structure from '../containers/structure/Box';
import UnitList from '../containers/unit/List';
import { loadDynamicComponent } from '@erxes/ui/src/utils/core';

export default function LeftSidebar({
  loadingMainQuery
}: {
  loadingMainQuery: boolean;
}) {
  return (
    <Sidebar hasBorder>
      <Structure />
      <DepartmentList />
      <UnitList />
      <BranchList />
      {loadDynamicComponent('teamMemberSidebarComp', {
        loadingMainQuery
      })}
    </Sidebar>
  );
}
