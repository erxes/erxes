import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import {
  BrandFilter,
  LeadStatusFilter,
  LifecycleStateFilter,
  SegmentFilter,
  TagFilter
} from '../../containers/filters';

function Sidebar() {
  return (
    <Wrapper.Sidebar>
      <SegmentFilter />
      <TagFilter />
      <LeadStatusFilter />
      <LifecycleStateFilter />
      <BrandFilter />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
