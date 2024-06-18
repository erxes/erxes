import React from 'react';

import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';

import Goals from '../containers/section/Goal';
import Dashboard from '../containers/section/Dashboard';
import Reports from '../containers/section/Report';

type Props = {
  queryParams: any;
};

const Sidebar = (props: Props) => {
  const { queryParams } = props;

  const renderDashboard = () => {
    return <Dashboard queryParams={queryParams} />;
  };

  const renderGoals = () => {
    return <Goals queryParams={queryParams} />;
  };

  const renderReports = () => {
    return <Reports queryParams={queryParams} />;
  };

  return (
    <Wrapper.Sidebar hasBorder={true}>
      {renderDashboard()}
      { }
      {renderReports()}
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
