import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import BrandFilter from '../containers/filters/BrandFilter';
import StatusFilter from '../containers/filters/StatusFilter';
import TagFilter from '../containers/filters/TagFilter';

function Sidebar() {
  return (
    <Wrapper.Sidebar>
      <TagFilter counts={{}} />
      <BrandFilter counts={{}} />
      <StatusFilter counts={{ active: 2, archived: 2 }} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
