import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import SegmentFilter from '../../containers/filters/SegmentFilter';
import TagFilter from '../../containers/filters/TagFilter';

function Sidebar({ loadingMainQuery }: { loadingMainQuery: boolean }) {
  return (
    <Wrapper.Sidebar>
      <SegmentFilter loadingMainQuery={loadingMainQuery} />
      <TagFilter loadingMainQuery={loadingMainQuery} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
