import { __ } from 'modules/common/utils';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { PROPERTY_GROUPS } from '../constants';
import { SidebarList } from 'modules/settings/styles';
import SidebarHeader from 'modules/settings/common/components/SidebarHeader';

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
    return PROPERTY_GROUPS.map(group => (
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
