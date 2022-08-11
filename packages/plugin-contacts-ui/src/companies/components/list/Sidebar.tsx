import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import SegmentFilter from '../../containers/filters/SegmentFilter';
import TagFilter from '../../containers/filters/TagFilter';
import { isEnabled } from '@erxes/ui/src/utils/core';

function Sidebar({ loadingMainQuery }: { loadingMainQuery: boolean }) {
  if (isEnabled('segments' || 'tags')) {
    return (
      <Wrapper.Sidebar hasBorder>
        {isEnabled('segments') && (
          <SegmentFilter loadingMainQuery={loadingMainQuery} />
        )}
        {isEnabled('tags') && <TagFilter loadingMainQuery={loadingMainQuery} />}
      </Wrapper.Sidebar>
    );
  }
  return null;
}

export default Sidebar;
