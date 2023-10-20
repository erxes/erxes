import { __ } from '@erxes/ui/src/utils/core';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';
import { SidebarListItem } from '@erxes/ui-settings/src/styles';

function ListItem(value, type) {
  const isActive = value.contentType === type;

  return (
    <SidebarListItem key={value.contentType} isActive={isActive}>
      <Link to={`/settings/tags?type=${value.contentType}`}>
        {__(value.description)}
      </Link>
    </SidebarListItem>
  );
}

function TagsSidebar({ types, type }: { types: any[]; type: string }) {
  return (
    <LeftSidebar header={<SidebarHeader />} hasBorder>
      <SidebarList noTextColor={true} noBackground={true} id={'TagsSidebar'}>
        {types.map(value => {
          return ListItem(value, type);
        })}
      </SidebarList>
    </LeftSidebar>
  );
}

export default TagsSidebar;
