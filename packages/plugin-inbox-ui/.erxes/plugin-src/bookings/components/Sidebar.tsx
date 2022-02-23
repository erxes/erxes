import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import BrandFilter from '@erxes/ui-leads/src/containers/filters/BrandFilter';
import StatusFilter from '@erxes/ui-leads/src/containers/filters/StatusFilter';
import TagFilter from '@erxes/ui-leads/src/containers/filters/TagFilter';
import { IntegrationsCount } from '@erxes/ui-leads/src/types';
import { Counts } from '@erxes/ui/src/types';

type Props = {
  counts: {
    byTag: Counts;
    byBrand: Counts;
    byStatus: Counts;
  } & IntegrationsCount[];
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
