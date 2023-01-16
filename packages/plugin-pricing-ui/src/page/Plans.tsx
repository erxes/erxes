import React from 'react';
// erxes
import { __ } from '@erxes/ui/src';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
// local
import List from '../containers/plan/List';
import ActionBar from '../components/plan/Actionbar';
import Sidebar from '../components/plan/Sidebar';
import { SUBMENU } from '../constants';

const Plans = () => {
  return (
    <Wrapper
      header={<Wrapper.Header title={__('Pricing Plans')} submenu={SUBMENU} />}
      content={<List />}
      actionBar={<ActionBar />}
      leftSidebar={<Sidebar />}
      transparent
      hasBorder
    />
  );
};

export default Plans;
