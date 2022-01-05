import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import BrandFilter from '@erxes/ui/src/leads/containers/filters/BrandFilter';
import StatusFilter from '@erxes/ui/src/leads/containers/filters/StatusFilter';
import TagFilter from '@erxes/ui/src/leads/containers/filters/TagFilter';
import { Counts } from '@erxes/ui/src/leads/types';

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
