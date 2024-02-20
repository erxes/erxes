import React from 'react';
import { Box, router } from '@erxes/ui/src';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';

import CollapsibleList from '@erxes/ui/src/components/collapsibleList/CollapsibleList';

import { gql, useQuery, useMutation } from '@apollo/client';
import { queries, mutations } from '../graphql';

import Goals from '../containers/section/Goal';
import Dashboard from '../containers/section/Dashboard';
import Reports from '../containers/section/Report';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  queryParams: any;
  history: any;
};

const Sidebar = (props: Props) => {
  const { queryParams, history } = props;

  const renderDashboard = () => {
    return <Dashboard queryParams={queryParams} history={history} />;
  };

  const renderGoals = () => {
    return <Goals queryParams={queryParams} history={history} />;
  };

  const renderReports = () => {
    return <Reports queryParams={queryParams} history={history} />;
  };

  return (
    <Wrapper.Sidebar hasBorder={true}>
      {renderDashboard()}
      {/* {isEnabled('goals') && renderGoals()} */}
      {isEnabled('reports') && renderReports()}
    </Wrapper.Sidebar>
  );
};

export default Sidebar;
