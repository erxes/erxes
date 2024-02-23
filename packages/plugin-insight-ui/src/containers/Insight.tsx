import React from 'react';
import Insight from '../components/Insight';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

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

type Props = {
  history: any;
  queryParams: any;
};

const InsightContainer = (props: Props) => {
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

export default InsightContainer;
