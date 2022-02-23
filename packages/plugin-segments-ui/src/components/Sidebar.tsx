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

function TagsSidebar() {
  return (
    <LeftSidebar full={true} header={<SidebarHeader />}>
      <LeftSidebar.Header uppercase={true}>
        {__('Segments type')}
      </LeftSidebar.Header>
      <SidebarList id={'SegmentSidebar'}>
        {ListItem('/segments/customer', 'Customer')}
        {ListItem('/segments/lead', 'Lead')}
        {ListItem('/segments/visitor', 'Visitor')}
        {ListItem('/segments/company', 'Company')}
        {ListItem('/segments/deal', 'Sales Pipeline')}
        {ListItem('/segments/task', 'Task')}
        {ListItem('/segments/ticket', 'Ticket')}
        {ListItem('/segments/conversation', 'Conversation')}
        {ListItem('/segments/user', 'Team member')}
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

export default TagsSidebar;
