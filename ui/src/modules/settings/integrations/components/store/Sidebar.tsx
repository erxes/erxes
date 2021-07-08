import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { INTEGRATION_FILTERS } from '../../constants';
import LeftSidebar from 'modules/layout/components/Sidebar';
import { SidebarList as List } from 'modules/layout/styles';
import Button from 'modules/common/components/Button';
import { TopHeader } from 'modules/common/styles/main';
import { SidebarList } from 'modules/settings/styles';

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
    const topHeader = (
      <TopHeader>
        <Link to="/settings/">
          <Button
            btnStyle="simple"
            icon="arrow-circle-left"
            block={true}
            uppercase={false}
          >
            Back to Settings
          </Button>
        </Link>
      </TopHeader>
    );

    return (
      <LeftSidebar header={topHeader} full={true}>
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
