import * as React from 'react';

import { CountsByTag } from 'modules/common/components';
import {
  LeadStatusFilter,
  LifecycleStateFilter
} from 'modules/customers/components';
import { Wrapper } from 'modules/layout/components';

import { BrandFilter } from 'modules/customers/containers';

import Segments from 'modules/segments/containers/Filter';
import { ITag } from 'modules/tags/types';

type Props = {
  counts: any;
  tags: ITag[];
  loading: boolean;
};

function Sidebar({ counts, tags, loading }: Props) {
  return (
    <Wrapper.Sidebar>
      <Segments contentType="company" counts={counts.bySegment} />
      <CountsByTag
        tags={tags}
        counts={counts.byTag}
        manageUrl="tags/company"
        loading={loading}
      />
      <LeadStatusFilter counts={counts.byLeadStatus} loading={loading} />
      <LifecycleStateFilter
        counts={counts.byLifecycleState}
        loading={loading}
      />
      <BrandFilter counts={counts.byBrand} loading={loading} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
