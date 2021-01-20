import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import BrandFilter from '../../containers/filters/BrandFilter';
import IntegrationFilter from '../../containers/filters/IntegrationFilter';
import LeadFilter from '../../containers/filters/LeadFilter';
import LeadStatusFilter from '../../containers/filters/LeadStatusFilter';
import SegmentFilter from '../../containers/filters/SegmentFilter';
import TagFilter from '../../containers/filters/TagFilter';

function Sidebar({
  loadingMainQuery,
  type
}: {
  loadingMainQuery: boolean;
  type: string;
}) {
  return (
    <Wrapper.Sidebar>
      <SegmentFilter type={type} loadingMainQuery={loadingMainQuery} />
      <TagFilter type={type} loadingMainQuery={loadingMainQuery} />
      <IntegrationFilter type={type} loadingMainQuery={loadingMainQuery} />
      <BrandFilter type={type} loadingMainQuery={loadingMainQuery} />
      <LeadFilter type={type} loadingMainQuery={loadingMainQuery} />
      {type === 'lead' && (
        <LeadStatusFilter type={type} loadingMainQuery={loadingMainQuery} />
      )}
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
