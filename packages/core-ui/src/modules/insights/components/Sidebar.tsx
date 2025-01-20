import React from 'react';

import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

import Dashboards from '../containers/section/Dashboard';
import Reports from '../containers/section/Report';
import Pinned from '../containers/section/Pinned';

type Props = {
  queryParams: any;
};

const Sidebar = (props: Props) => {
  const { queryParams } = props;

  const renderPinned = () => {
    return <Pinned queryParams={queryParams} />;
  }

  const renderDashboards = () => {
    return <Dashboards queryParams={queryParams} />;
  };

  const renderReports = () => {
    return <Reports queryParams={queryParams} />;
  };

  return (
    <Wrapper.Sidebar hasBorder={true}>
      {renderPinned()}
      {renderDashboards()}
      {renderReports()}
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
