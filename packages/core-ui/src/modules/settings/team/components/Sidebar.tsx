import BlockList from "../containers/common/BlockList";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import SegmentsFilter from "@erxes/ui-segments/src/components/filter/SegmentsFilter";

export default function LeftSidebar({
  loadingMainQuery,
  queryParams
}: {
  loadingMainQuery: boolean;
  queryParams: Record<string, string>;
}) {
  return (
    <Sidebar hasBorder={true}>
      <BlockList
        queryType="branches"
        title="Branch"
        queryParams={queryParams}
      />
      <BlockList
        queryType="departments"
        title="Department"
        queryParams={queryParams}
      />
      <BlockList queryType="units" title="Unit" queryParams={queryParams} />
      <SegmentsFilter loadingMainQuery={loadingMainQuery} />
    </Sidebar>
  );
}
