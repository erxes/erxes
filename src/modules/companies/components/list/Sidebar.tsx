import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import BrandFilter from '../../containers/filters/BrandFilter';
import LeadStatusFilter from '../../containers/filters/LeadStatusFilter';
import LifecycleStateFilter from '../../containers/filters/LifecycleStateFilter';
import SegmentFilter from '../../containers/filters/SegmentFilter';
import TagFilter from '../../containers/filters/TagFilter';

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
