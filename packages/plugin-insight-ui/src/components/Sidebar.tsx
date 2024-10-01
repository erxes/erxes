import React from 'react';

import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { isEnabled } from '@erxes/ui/src/utils/core';

import Goals from '../containers/section/Goal';
import Dashboards from '../containers/section/Dashboard';
import Reports from '../containers/section/Report';
import Favorites from '../containers/section/Favorite';

type Props = {
  queryParams: string;
};

const Sidebar = (props: Props) => {
  const { queryParams } = props;

  const renderFavorites = () => {
    return <Favorites queryParams={queryParams} />;
  }

  const renderDashboards = () => {
    return <Dashboards queryParams={queryParams} />;
  };

  const renderGoals = () => {
    return <Goals queryParams={queryParams} />;
  };

  const renderReports = () => {
    return <Reports queryParams={queryParams} />;
  };

  return (
    <Wrapper.Sidebar hasBorder={true}>
      {renderFavorites()}
      {renderDashboards()}
      {/* {isEnabled('goals') && renderGoals()} */}
      {renderReports()}
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
