import { Sidebar as CommonSidebar } from '@erxes/ui/src';
import React from 'react';
import { Padding } from '../../styles';
import Categories from '../categories/containers/List';

type Props = {
  history: any;
  queryParams: any;
};

class SideBar extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { queryParams, history } = this.props;

    return (
      <CommonSidebar full>
        <Padding>
          <Categories history={history} queryParams={queryParams} />
        </Padding>
      </CommonSidebar>
    );
  }
}

export default SideBar;
