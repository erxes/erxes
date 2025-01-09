import React, { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { useLocation, useNavigate } from "react-router-dom";

import Insight from "../components/Insight";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { queries } from "../graphql";
import { router } from "@erxes/ui/src/utils";

const Dashboard = asyncComponent(
  () =>
    import(/* webpackChunkName: "DashboardComponent" */ "./dashboard/Dashboard")
);

const Report = asyncComponent(
  () => import(/* webpackChunkName: "Report" */ "./report/Report")
);

const Empty = asyncComponent(
  () => import(/* webpackChunkName: "Empty" */ "../components/Empty")
);

type FinalProps = {
  queryParams: any;
  currentDashboardId: string;
  loading: boolean;
};

const InsightContainer = (props: FinalProps) => {
  const { queryParams } = props;
  const { dashboardId, reportId } = queryParams;

  let component: any;

  switch (true) {
    case !!dashboardId:
      component = Dashboard;
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
    component
  };

  return <Insight {...updatedProps} />;
};

type Props = {
  queryParams: any;
};

const withLastDashboard = (props: Props) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { queryParams } = props;
  const { goalId, dashboardId, reportId } = queryParams;

  const dashboardGetLastQuery = useQuery(gql(queries.insightGetLast), {
    skip: dashboardId || goalId || reportId,
    fetchPolicy: "network-only"
  });

  const dashboard = dashboardGetLastQuery?.data?.insightGetLast;

  useEffect(() => {
    if (
      Object.keys(queryParams).length === 0 &&
      dashboard &&
      !dashboardGetLastQuery.loading
    ) {
      router.setParams(
        navigate,
        location,
        { [dashboard?.type + "Id"]: dashboard?._id },
        true
      );
      return;
    }
  }, [dashboard]);

  const updatedProps = {
    ...props,
    currentDashboardId: dashboard?._id,
    loading: dashboardGetLastQuery.loading
  };

  return <InsightContainer {...updatedProps} />;
};

export default withLastDashboard;
