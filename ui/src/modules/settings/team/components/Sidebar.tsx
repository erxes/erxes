import React from 'react';

import Sidebar from 'modules/layout/components/Sidebar';
import DepartmentList from '../containers/department/List';

export default function LeftSidebar() {
  return (
    <Sidebar>
      <DepartmentList />
    </Sidebar>
  );
}
