import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { INTEGRATION_FILTERS } from '../../constants';
import LeftSidebar from 'modules/layout/components/Sidebar';
import {
  Category,
  TopHeader,
  SidebarList,
  FixedSection,
  SideBarContent
} from './styles';
import Button from 'modules/common/components/Button';

type Props = {
  currentType: string;
};

class SideBar extends React.Component<Props> {
  renderCategory(item) {
    return (
      <Link key={item} to={`?type=${item}`}>
        <Category
          key={item}
          isActive={(this.props.currentType || 'All integrations') === item}
        >
          {item}
        </Category>
      </Link>
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
      <LeftSidebar header={topHeader}>
        <FixedSection>
          <SideBarContent>
            {INTEGRATION_FILTERS.map((data, index) => (
              <SidebarList key={index}>
                <h4>{__(data.name)}</h4>
                {data.items.map(item => this.renderCategory(__(item)))}
              </SidebarList>
            ))}
          </SideBarContent>
        </FixedSection>
      </LeftSidebar>
    );
  }
}

export default SideBar;
