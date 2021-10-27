import { Wrapper } from 'erxes-ui';
import React from 'react';
import { Counts } from '../../types';
import BrandFilter from '../containers/filters/BrandFilter';
import TagFilter from '../containers/filters/TagFilter';

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
      <BrandFilter counts={counts.byBrand} />
      <TagFilter counts={counts.byTag} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
