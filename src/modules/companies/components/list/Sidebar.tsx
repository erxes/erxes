import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import {
  BrandFilter,
  LeadStatusFilter,
  LifecycleStateFilter,
  SegmentFilter,
  TagFilter
} from '../../containers/filters';

function Sidebar({ loadingMainQuery }: { loadingMainQuery: boolean }) {
  return (
    <Wrapper.Sidebar>
      <SegmentFilter loadingMainQuery={loadingMainQuery} />
      <TagFilter loadingMainQuery={loadingMainQuery} />
      <LeadStatusFilter loadingMainQuery={loadingMainQuery} />
      <LifecycleStateFilter loadingMainQuery={loadingMainQuery} />
      <BrandFilter loadingMainQuery={loadingMainQuery} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
