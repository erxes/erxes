import React from 'react';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList, __ } from '@erxes/ui/src';
import { Link } from 'react-router-dom';
import { SidebarCounter, FieldStyle } from '@erxes/ui/src/layout/styles';

function ListItem(url, text, totalCount?) {
  return (
    <li>
      <Link
        to={url}
        className={window.location.href.includes(url) ? 'active' : ''}
      >
        <FieldStyle>{__(text)}</FieldStyle>
        <SidebarCounter nowrap={true}>{totalCount}</SidebarCounter>
      </Link>
    </li>
  );
}

type Props = {
  branchTotalCount: number;
  unitTotalCount: number;
  departmentTotalCount: number;
};

export default class SettingsSideBar extends React.Component<Props> {
  render() {
    return (
      <LeftSidebar header={<SidebarHeader />} hasBorder={true}>
        <SidebarList>
          {ListItem('/settings/structure', 'Structure')}
          {ListItem(
            '/settings/branches',
            'Branches',
            this.props.branchTotalCount
          )}
          {ListItem(
            '/settings/departments',
            'Departments',
            this.props.departmentTotalCount
          )}
          {ListItem('/settings/units', 'Units', this.props.unitTotalCount)}
        </SidebarList>
      </LeftSidebar>
    );
  }
}
