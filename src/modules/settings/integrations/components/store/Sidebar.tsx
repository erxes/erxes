import LeftSidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import { INTEGRATION_FILTERS } from '../../constants';
import { SidebarList } from './styles';

type Props = {
  queryParams?: any;
};

class SideBar extends React.Component<Props> {
  onFilter = item => {
    // tslint:disable-next-line:no-console
    console.log(item);
  };

  render() {
    return (
      <LeftSidebar>
        <LeftSidebar.Section>
          {INTEGRATION_FILTERS.map((data, index) => (
            <SidebarList key={index}>
              <h4>{data.name}</h4>
              {data.items.map(item => (
                <li key={index} onClick={this.onFilter.bind(this, item)}>
                  {item}
                </li>
              ))}
            </SidebarList>
          ))}
        </LeftSidebar.Section>
      </LeftSidebar>
    );
  }
}

export default SideBar;
