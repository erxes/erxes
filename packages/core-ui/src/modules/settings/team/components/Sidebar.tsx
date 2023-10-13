import List from '../containers/common/List';
import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { loadDynamicComponent } from '@erxes/ui/src/utils/core';

export default function LeftSidebar({
  loadingMainQuery
}: {
  loadingMainQuery: boolean;
}) {
  return (
    <Sidebar hasBorder>
      <List />
      {loadDynamicComponent('teamMemberSidebarComp', {
        loadingMainQuery
      })}
    </Sidebar>
  );
}
