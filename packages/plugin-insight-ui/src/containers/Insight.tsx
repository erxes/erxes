import React, { useEffect } from 'react';

import { gql, useQuery } from '@apollo/client';

import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { router } from '@erxes/ui/src/utils';

import Insight from '../components/Insight';
import { queries } from '../graphql';

const Dashboard = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "InsightList" */ '../containers/dashboard/Dashboard'
    ),
);

const Goal = asyncComponent(
  () => import(/* webpackChunkName: "InsightList" */ '../containers/goal/Goal'),
);

const Report = asyncComponent(
  () =>
    import(/* webpackChunkName: "InsightList" */ '../containers/report/Report'),
);

const Empty = asyncComponent(
  () => import(/* webpackChunkName: "InsightList" */ '../components/Empty'),
);

type FinalProps = {
  history: any;
  queryParams: any;
  currentDashboardId: string;
  loading: boolean;
};

const InsightContainer = (props: FinalProps) => {
  const { queryParams } = props;
  const { goalId, dashboardId, reportId } = queryParams;

  let component: any;

  switch (true) {
    case !!dashboardId:
      component = Dashboard;
      break;
    case !!goalId:
      component = Goal;
      break;
    case !!reportId:
      component = Report;
      break;
    default:
      component = Empty;
      break;
  }

  const updatedProps = {
    ...props,
    component,
  };

  return <Insight {...updatedProps} />;
};

type Props = {
  history: any;
  queryParams: any;
};

const withLastDashboard = (props: Props) => {
  const { queryParams, history } = props;
  const { goalId, dashboardId, reportId } = queryParams;

  const dashboardGetLastQuery = useQuery(gql(queries.dashboardGetLast), {
    skip: dashboardId || goalId || reportId,
    fetchPolicy: 'network-only',
  });

  const dashboard = dashboardGetLastQuery?.data?.dashboardGetLast;

  useEffect(() => {
    if (
      Object.keys(queryParams).length === 0 &&
      dashboard &&
      !dashboardGetLastQuery.loading
    ) {
      router.setParams(
        history,
        { [dashboard?.type + 'Id']: dashboard?._id },
        true,
      );
      return;
    }
  }, [dashboard]);

  const updatedProps = {
    ...props,
    currentDashboardId: dashboard?._id,
    loading: dashboardGetLastQuery.loading,
  };

  return <InsightContainer {...updatedProps} />;
};

export default withLastDashboard;
