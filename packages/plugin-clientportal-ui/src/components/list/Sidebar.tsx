import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
// import SegmentFilter from "../../containers/filters/SegmentFilter";
// import TagFilter from "../../containers/filters/TagFilter";
import { isEnabled } from '@erxes/ui/src/utils/core';

function Sidebar({
  loadingMainQuery,
  type
}: {
  loadingMainQuery: boolean;
  type: string;
}) {
  return (
    <Wrapper.Sidebar>
      {/* {isEnabled("segments") && (
        <SegmentFilter type={type} loadingMainQuery={loadingMainQuery} />
      )}
      {isEnabled("tags") && (
        <TagFilter type={type} loadingMainQuery={loadingMainQuery} />
      )} */}
      <div>helloo</div>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
