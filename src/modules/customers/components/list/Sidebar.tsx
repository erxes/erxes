import { Wrapper } from 'modules/layout/components';
import * as React from 'react';
import {
  BrandFilter,
  FormFilter,
  IntegrationFilter,
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
      <IntegrationFilter />
      <BrandFilter />
      <FormFilter />
      <LeadStatusFilter />
      <LifecycleStateFilter />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
