import { Wrapper } from '@erxes/ui/src';
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
    <Wrapper.Sidebar hasBorder={true}>
      <BrandFilter counts={counts.byBrand} />
      <TagFilter counts={counts.byTag} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
