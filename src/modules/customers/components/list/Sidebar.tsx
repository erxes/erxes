import { Wrapper } from 'modules/layout/components';
import React from 'react';
import {
  BrandFilter,
  FormFilter,
  IntegrationFilter,
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
      <IntegrationFilter loadingMainQuery={loadingMainQuery} />
      <BrandFilter loadingMainQuery={loadingMainQuery} />
      <FormFilter loadingMainQuery={loadingMainQuery} />
      <LeadStatusFilter loadingMainQuery={loadingMainQuery} />
      <LifecycleStateFilter loadingMainQuery={loadingMainQuery} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
