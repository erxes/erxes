import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';
import TagFilter from '../containers/filters/TagFilter';
import DepartmentFilter from '../containers/filters/DepartmentFilter';

type Props = {};
function Sidebar(props: any) {
  return (
    <Wrapper.Sidebar hasBorder>
      {isEnabled('tags') && <TagFilter />}

      <DepartmentFilter />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
