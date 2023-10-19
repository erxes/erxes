import List from '../containers/common/List';
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
      <List queryType="branches" title="Branch" queryParams={queryParams} />
      <List
        queryType="departments"
        title="Department"
        queryParams={queryParams}
      />
      <List queryType="units" title="Unit" queryParams={queryParams} />
      {loadDynamicComponent('teamMemberSidebarComp', {
        loadingMainQuery
      })}
    </Sidebar>
  );
}
