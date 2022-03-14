import { __ } from '@erxes/ui/src/utils';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList as List } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { SidebarList } from '@erxes/ui-settings/src/styles';
import SidebarHeader from '@erxes/ui-settings/src/common/components/SidebarHeader';

type Props = {
  fieldTypes: Array<{ description: string, contentType: string }>;
  currentType: string;
};

class Sidebar extends React.Component<Props> {
  renderListItem(type) {
    const className = this.props.currentType === type ? 'active' : '';

    return (
      <li key={type.contentType}>
        <Link to={`?type=${type.contentType}`} className={className}>
          {__(type.description)}
        </Link>
      </li>
    );
  }

  renderSideBar() {
    return (
      <SidebarList>
        <List>
          {this.props.fieldTypes.map(type => {
            return this.renderListItem(type);
          })}
        </List>
      </SidebarList>
    )
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
