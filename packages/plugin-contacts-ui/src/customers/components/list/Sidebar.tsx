import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import BrandFilter from '../../containers/filters/BrandFilter';
import IntegrationFilter from '../../containers/filters/IntegrationFilter';
import LeadFilter from '../../containers/filters/LeadFilter';
import LeadStatusFilter from '../../containers/filters/LeadStatusFilter';
import SegmentFilter from '../../containers/filters/SegmentFilter';
import TagFilter from '../../containers/filters/TagFilter';
import { isEnabled } from '@erxes/ui/src/utils/core';

function Sidebar({
  loadingMainQuery,
  type
}: {
  loadingMainQuery: boolean;
  type: string;
}) {
  return (
    <Wrapper.Sidebar hasBorder>
      {isEnabled('segments') && (
        <SegmentFilter type={type} loadingMainQuery={loadingMainQuery} />
      )}
      {isEnabled('tags') && (
        <TagFilter type={type} loadingMainQuery={loadingMainQuery} />
      )}
      {isEnabled('inbox') && (
        <IntegrationFilter type={type} loadingMainQuery={loadingMainQuery} />
      )}
      <BrandFilter type={type} loadingMainQuery={loadingMainQuery} />
      {isEnabled('inbox') && (
        <LeadFilter type={type} loadingMainQuery={loadingMainQuery} />
      )}
      {type === 'inbox' && (
        <LeadStatusFilter type={type} loadingMainQuery={loadingMainQuery} />
      )}
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
