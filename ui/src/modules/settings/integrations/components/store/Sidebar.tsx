import React from 'react';
import { Link } from 'react-router-dom';
import { INTEGRATION_FILTERS } from '../../constants';
import { Category, FixedSection, LeftSidebar, SidebarList } from './styles';

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
    return (
      <LeftSidebar>
        <FixedSection>
          {INTEGRATION_FILTERS.map((data, index) => (
            <SidebarList key={index}>
              <h4>{data.name}</h4>
              {data.items.map(item => this.renderCategory(item))}
            </SidebarList>
          ))}
        </FixedSection>
      </LeftSidebar>
    );
  }
}

export default SideBar;
