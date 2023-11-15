import React from 'react';

import { Sidebar as CommonSidebar } from '@erxes/ui/src';
import { Padding } from '../styles';
import Categories from '../categories/containers/List';

type Props = {
  history: any;
  queryParams: any;
};

function SideBar(props: Props) {
  const { queryParams, history } = props;

  return (
    <CommonSidebar full={true}>
      <Padding>
        <Categories history={history} queryParams={queryParams} />
      </Padding>
    </CommonSidebar>
  );
}

export default SideBar;
