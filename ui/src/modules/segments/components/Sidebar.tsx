import { __ } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList } from 'modules/layout/styles';
import React from 'react';
import { NavLink } from 'react-router-dom';
import SidebarHeader from 'modules/settings/common/components/SidebarHeader';

function ListItem(link: string, label: string) {
  return (
    <li>
      <NavLink activeClassName="active" to={link}>
        {__(label)}
      </NavLink>
    </li>
  );
}

type Props = {
  types: Array<{ name: string; description: string }>;
};

function Sidebar(props: Props) {
  return (
    <LeftSidebar full={true} header={<SidebarHeader />}>
      <LeftSidebar.Header uppercase={true}>
        {__('Segments type')}
      </LeftSidebar.Header>

      <SidebarList id={'SegmentSidebar'}>
        {props.types.map(type => {
          return ListItem(`/segments/${type.name}`, type.description);
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
