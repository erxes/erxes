import { __ } from '@erxes/ui/src/utils';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList as List } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { getPropertiesGroups } from '../constants';
import { SidebarList } from '@erxes/ui-settings/src/styles';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

type Props = {
  currentType: string;
};

class Sidebar extends React.Component<Props> {
  renderListItem(group: string, type: string, text: string) {
    const className = this.props.currentType === type ? 'active' : '';

    return (
      <li key={`${group}_${type}`}>
        <Link to={`?type=${type}`} className={className}>
          {__(text)}
        </Link>
      </li>
    );
  }

  renderSideBar() {
    return getPropertiesGroups().map(group => (
      <SidebarList key={group.value}>
        <LeftSidebar.Header uppercase={true}>{group.value}</LeftSidebar.Header>
        <List key={`list_${group.value}`}>
          {group.types.map(type => {
            return this.renderListItem(group.value, type.value, type.label);
          })}
        </List>
      </SidebarList>
    ));
  }

  render() {
    return (
      <LeftSidebar header={<SidebarHeader />} full={true}>
        {this.renderSideBar()}
      </LeftSidebar>
    );
  }
}

export default Sidebar;
