import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';
import TagFilter from '../containers/filters/TagFilter';

function Sidebar() {
  return (
    <Wrapper.Sidebar hasBorder>
      {isEnabled('tags') && <TagFilter />}
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
