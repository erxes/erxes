import { __ } from '@erxes/ui/src/utils/core';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

function ListItem(value, type) {
  const className = type && type === value.contentType ? 'active' : '';
  console.log('tags type: ', type);
  console.log('tags value: ', value.contentType);

  return (
    <li key={value.contentType}>
      <Link className={className} to={`/tags?type=${value.contentType}`}>
        {__(value.description)}
      </Link>
    </li>
  );
}

function TagsSidebar({ types, type }: { types: any[]; type: string }) {
  return (
    <LeftSidebar header={<SidebarHeader />} hasBorder>
      <LeftSidebar.Header uppercase={true}>
        {__('Tags type')}
      </LeftSidebar.Header>
      <SidebarList noTextColor noBackground id={'TagsSidebar'}>
        {types.map(value => {
          return ListItem(value, type);
        })}
      </SidebarList>
    </LeftSidebar>
  );
}

export default TagsSidebar;
