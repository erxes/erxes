import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';
import TagFilter from '../containers/filters/TagFilter';
import DepartmentFilter from '../containers/filters/department/DepartmentFilter';

function Sidebar() {
  return (
    <Wrapper.Sidebar hasBorder>
      {isEnabled('tags') && <TagFilter />}

      <DepartmentFilter />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
