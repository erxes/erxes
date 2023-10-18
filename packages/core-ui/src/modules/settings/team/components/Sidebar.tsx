import React from 'react';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import List from '../containers/branch/List';
import { loadDynamicComponent } from '@erxes/ui/src/utils/core';

type TeamSidebarProps = {
  loadingMainQuery: boolean;
  queryParams: string;
};

const TeamSidebar: React.FC<TeamSidebarProps> = ({
  loadingMainQuery,
  queryParams
}) => {
  return (
    <Sidebar hasBorder={true}>
      <List queryType="branches" title="Branch" queryParams={queryParams} />
      <List
        queryParams={queryParams}
        queryType="departments"
        title="Department"
      />
      <List queryParams={queryParams} queryType="units" title="Unit" />
      {loadDynamicComponent('teamMemberSidebarComp', {
        loadingMainQuery
      })}
    </Sidebar>
  );
};

export default TeamSidebar;
