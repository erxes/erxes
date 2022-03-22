import { __ } from 'coreui/utils';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

function ListItem(value, type) {
  const className = type && type === value.contentType ? 'active' : '';

  return (
    <li key={value.contentType}>
      <Link className={className} to={`/tags?type=${value.contentType}`}>
        {__(value.description)}
      </Link>
    </li>
  );
}

function TagsSidebar({ types, type }: { types: any[]; type: string }) {
  console.log('21313', types);
  return (
    <LeftSidebar full={true} header={<SidebarHeader />}>
      <LeftSidebar.Header uppercase="uppercase">
        {__('Tags type')}
      </LeftSidebar.Header>
      <SidebarList id={'TagsSidebar'}>
        {types.map(value => {
          return ListItem(value, type);
        })}
      </SidebarList>
    </LeftSidebar>
  );
}

export default TagsSidebar;
