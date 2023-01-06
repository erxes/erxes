import React from 'react';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList, __ } from '@erxes/ui/src';
import { Link } from 'react-router-dom';

function ListItem(url, text) {
  return (
    <li>
      <Link
        to={url}
        className={window.location.href.includes(url) ? 'active' : ''}
      >
        {__(text)}
      </Link>
    </li>
  );
}

export default function SettingsSideBar() {
  return (
    <LeftSidebar header={<SidebarHeader />} hasBorder>
      <LeftSidebar.Header uppercase>{__('Structures')}</LeftSidebar.Header>
      <SidebarList>
        {ListItem('/settings/structure', 'Structure')}
        {ListItem('/settings/branches', 'Branches')}
        {ListItem('/settings/departments', 'Departments')}
        {ListItem('/settings/units', 'Units')}
      </SidebarList>
    </LeftSidebar>
  );
}
