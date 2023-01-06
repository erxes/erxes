import React from 'react';
// erxes
import { __ } from '@erxes/ui/src';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
// local
import List from '../containers/discount/List';
import ActionBar from '../containers/discount/Actionbar';
import Sidebar from '../containers/discount/Sidebar';
import { SUBMENU } from '../constants';

const Discounts = () => {
  return (
    <Wrapper
      header={<Wrapper.Header title={__('Discounts')} submenu={SUBMENU} />}
      content={<List />}
      actionBar={<ActionBar />}
      leftSidebar={<Sidebar />}
      transparent
      hasBorder
    />
  );
};

export default Discounts;
