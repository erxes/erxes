import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { Link } from 'react-router-dom';
import { INTEGRATION_FILTERS } from '@erxes/ui/src/constants/integrations';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList as List } from '@erxes/ui/src/layout/styles';
import { SidebarList } from '@erxes/ui-settings/src/styles';

type Props = {
  currentType: string;
};

class SideBar extends React.Component<Props> {
  renderCategory(item) {
    const className =
      (this.props.currentType || 'All integrations') === item ? 'active' : '';

    return (
      <li key={item}>
        <Link to={`?type=${item}`} className={className}>
          {item}
        </Link>
      </li>
    );
  }

  render() {
    return (
      <LeftSidebar hasBorder>
        <List id="SettingsSidebar">
          {INTEGRATION_FILTERS.map((data, index) => (
            <SidebarList key={index}>
              <LeftSidebar.Header uppercase={true}>
                {__(data.name)}
              </LeftSidebar.Header>
              {data.items.map(item => this.renderCategory(__(item)))}
            </SidebarList>
          ))}
        </List>
      </LeftSidebar>
    );
  }
}

export default SideBar;
