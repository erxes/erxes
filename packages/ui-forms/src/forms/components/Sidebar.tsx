import BrandFilter from '@erxes/ui-forms/src/forms/containers/filters/BrandFilter';
import StatusFilter from '@erxes/ui-forms/src/forms/containers/filters/StatusFilter';
import TagFilter from '@erxes/ui-forms/src/forms/containers/filters/TagFilter';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { Counts } from '@erxes/ui/src/types';
import React from 'react';

type Props = {
  counts: {
    byTag: Counts;
    byBrand: Counts;
    byStatus: Counts;
  };
};

function Sidebar({ counts }: Props) {
  return (
    <Wrapper.Sidebar hasBorder>
      <TagFilter counts={counts.byTag} />
      <BrandFilter counts={counts.byBrand} />
      <StatusFilter counts={counts.byStatus} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
