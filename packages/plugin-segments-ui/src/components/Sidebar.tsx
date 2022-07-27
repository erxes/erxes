import { __ } from '@erxes/ui/src/utils/core';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

function ListItem(type, contentType) {
  const className =
    contentType && contentType === type.contentType ? 'active' : '';

  return (
    <li key={type.contentType}>
      <Link
        className={className}
        to={`/segments?contentType=${type.contentType}`}
      >
        {__(type.description)}
      </Link>
    </li>
  );
}

function Sidebar({
  types,
  contentType
}: {
  types: Array<{ contentType: string; description: string }>;
  contentType: string;
}) {
  return (
    <LeftSidebar full={true} header={<SidebarHeader />}>
      <LeftSidebar.Header uppercase={true}>
        {__('Segments type')}
      </LeftSidebar.Header>

      <SidebarList id={'SegmentSidebar'}>
        {types.map(type => {
          return ListItem(type, contentType);
        })}

        <li>
          <a
            target="_blank"
            href="https://erxes.org/user/segments"
            rel="noopener noreferrer"
          >
            <u> {__('Learn how to create a segment')}</u>
          </a>
        </li>
      </SidebarList>
    </LeftSidebar>
  );
}

export default Sidebar;
