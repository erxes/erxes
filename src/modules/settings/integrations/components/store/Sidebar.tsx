import React from 'react';
import { INTEGRATION_FILTERS } from '../../constants';
import { Category, FixedSection, LeftSidebar, SidebarList } from './styles';

type Props = {
  getFilteredItem: (filteredItem: string) => void;
  filteredItem: string;
};

class SideBar extends React.Component<Props> {
  onFilter = item => {
    this.props.getFilteredItem(item);
  };

  renderCategory(item) {
    const { filteredItem } = this.props;

    return (
      <Category
        key={item}
        onClick={this.onFilter.bind(this, item)}
        isActive={filteredItem === item}
      >
        {item}
      </Category>
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
