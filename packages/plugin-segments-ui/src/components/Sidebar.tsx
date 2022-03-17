import { __ } from 'coreui/utils';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { NavLink } from 'react-router-dom';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

function ListItem(link: string, label: string) {
  return (
    <li>
      <NavLink activeClassName="active" to={link}>
        {__(label)}
      </NavLink>
    </li>
  );
}

function Sidebar({
  types
}: {
  types: Array<{ contentType: string; description: string }>;
}) {
  return (
    <LeftSidebar full={true} header={<SidebarHeader />}>
      <LeftSidebar.Header uppercase="uppercase">
        {__('Segments type')}
      </LeftSidebar.Header>

      <SidebarList id={'SegmentSidebar'}>
        {types.map(type => {
          return ListItem(`/segments/${type.contentType}`, type.description);
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
