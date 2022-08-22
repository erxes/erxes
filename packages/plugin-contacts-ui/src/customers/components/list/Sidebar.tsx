import BrandFilter from '../../containers/filters/BrandFilter';
import DateFilters from '@erxes/ui-forms/src/forms/containers/DateFilters';
import IntegrationFilter from '../../containers/filters/IntegrationFilter';
import LeadFilter from '../../containers/filters/LeadFilter';
import LeadStatusFilter from '../../containers/filters/LeadStatusFilter';
import React from 'react';
import SegmentFilter from '../../containers/filters/SegmentFilter';
import { SidebarContainer } from '@erxes/ui-forms/src/forms/styles';
import TagFilter from '../../containers/filters/TagFilter';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';

function Sidebar({
  loadingMainQuery,
  type
}: {
  loadingMainQuery: boolean;
  type: string;
}) {
  return (
    <SidebarContainer>
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
        {isEnabled('forms') && (
          <DateFilters
            type="contacts:customer"
            loadingMainQuery={loadingMainQuery}
          />
        )}
      </Wrapper.Sidebar>
    </SidebarContainer>
  );
}

export default Sidebar;
