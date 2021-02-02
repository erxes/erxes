import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import BrandFilter from '../containers/filters/BrandFilter';
import StatusFilter from '../containers/filters/StatusFilter';
import TagFilter from '../containers/filters/TagFilter';

function Sidebar({ counts }) {
  
  return (
    <Wrapper.Sidebar>
      <TagFilter counts={counts.byTag} />
      <BrandFilter counts={counts.byBrand} />
      <StatusFilter counts={counts.byStatus} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
