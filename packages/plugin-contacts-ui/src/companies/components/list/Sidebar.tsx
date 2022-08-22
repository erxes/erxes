import DateFilters from '@erxes/ui-forms/src/forms/containers/DateFilters';
import React from 'react';
import SegmentFilter from '../../containers/filters/SegmentFilter';
import TagFilter from '../../containers/filters/TagFilter';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';

function Sidebar({ loadingMainQuery }: { loadingMainQuery: boolean }) {
  return (
    <Wrapper.Sidebar hasBorder>
      {isEnabled('segments') && (
        <SegmentFilter loadingMainQuery={loadingMainQuery} />
      )}
      {isEnabled('tags') && <TagFilter loadingMainQuery={loadingMainQuery} />}
      {isEnabled('forms') && (
        <DateFilters
          type="contacts:company"
          loadingMainQuery={loadingMainQuery}
        />
      )}
    </Wrapper.Sidebar>
  );

  return null;
}

export default Sidebar;
