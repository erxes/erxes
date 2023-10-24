import BlockList from '../containers/common/BlockList';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { loadDynamicComponent } from '@erxes/ui/src/utils/core';

export default function LeftSidebar({
  loadingMainQuery,
  queryParams
}: {
  loadingMainQuery: boolean;
  queryParams: string;
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
      {loadDynamicComponent('teamMemberSidebarComp', {
        loadingMainQuery
      })}
    </Sidebar>
  );
}
