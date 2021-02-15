import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import BrandFilter from '../containers/filters/BrandFilter';
import StatusFilter from '../containers/filters/StatusFilter';
import TagFilter from '../containers/filters/TagFilter';
import { Counts } from '../types';

type Props = {
  counts: {
    byTag: Counts;
    byBrand: Counts;
    byStatus: Counts;
  };
};

function Sidebar({ counts }: Props) {
  return (
    <Wrapper.Sidebar>
      <TagFilter counts={counts.byTag} />
      <BrandFilter counts={counts.byBrand} />
      <StatusFilter counts={counts.byStatus} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
