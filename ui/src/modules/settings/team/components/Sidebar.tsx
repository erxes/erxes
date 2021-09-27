import React from 'react';

import Sidebar from 'modules/layout/components/Sidebar';
import DepartmentList from '../containers/department/List';
import UnitList from '../containers/unit/List';

export default function LeftSidebar() {
  return (
    <Sidebar>
      <DepartmentList />
      <UnitList />
    </Sidebar>
  );
}
