import { __ } from 'coreui/utils';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

function TagsSidebar() {
  return (
    <LeftSidebar hasBorder={true} header={<SidebarHeader />}>
      <LeftSidebar.Header uppercase={true}>
        {__('Tags type')}
      </LeftSidebar.Header>
      <SidebarList id={'TagsSidebar'}></SidebarList>
    </LeftSidebar>
  );
}

export default TagsSidebar;
