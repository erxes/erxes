import BrandFilter from '@erxes/ui-leads/src/containers/filters/BrandFilter';
import { Counts } from '@erxes/ui/src/types';
import { IntegrationsCount } from '@erxes/ui-leads/src/types';
import React from 'react';
import StatusFilter from '@erxes/ui-leads/src/containers/filters/StatusFilter';
import TagFilter from '@erxes/ui-leads/src/containers/filters/TagFilter';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  counts: {
    byTag: Counts;
    byBrand: Counts;
    byStatus: Counts;
  } & IntegrationsCount[];
};

function Sidebar({ counts }: Props) {
  return (
    <Wrapper.Sidebar hasBorder={true}>
      {isEnabled('tags') && <TagFilter counts={counts.byTag} />}
      <BrandFilter counts={counts.byBrand} />
      <StatusFilter counts={counts.byStatus} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
