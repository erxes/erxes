import DateFilters from '@erxes/ui-forms/src/forms/containers/DateFilters';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';
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
  );
}

export default Sidebar;
