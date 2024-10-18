import React from "react";

import Alert from "@erxes/ui/src/utils/Alert/index";
import confirm from "@erxes/ui/src/utils/confirmation/confirm";
import { gql, useQuery, useMutation } from "@apollo/client";
import { __ } from "@erxes/ui/src/utils/index";
import { router } from "@erxes/ui/src/utils";

import Dashboard from "../../components/dashboard/Dashboard";
import { queries, mutations } from "../../graphql";
import {
  DashboardDetailQueryResponse,
  DashboardRemoveMutationResponse,
  IDashboard,
  IReport,
} from "../../types";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

const DashboardContainer = (props: Props) => {
  const { queryParams } = props;

  const location = useLocation();
  const navigate = useNavigate();

  const dashboardDetailQuery = useQuery<DashboardDetailQueryResponse>(
    gql(queries.dashboardDetail),
    {
      skip: !queryParams.dashboardId,
      variables: {
        id: queryParams.dashboardId,
      },
      fetchPolicy: "network-only",
    }
  );

  const [dashboardDuplicateMutation] = useMutation(
    gql(mutations.dashboardDuplicate),
    {
      refetchQueries: [
        {
          query: gql(queries.sectionList),
          variables: { type: "dashboard" },
        },
        {
          query: gql(queries.dashboardList),
        },
      ],
    }
  );

  const [dashboardRemoveMutation] =
    useMutation<DashboardRemoveMutationResponse>(
      gql(mutations.dashboardRemove),
      {
        refetchQueries: [
          {
            query: gql(queries.dashboardList),
          },
        ],
      }
    );

  const dashboardDuplicate = (_id: string) => {
    dashboardDuplicateMutation({ variables: { _id } })
      .then((res) => {
        Alert.success("Successfully duplicated a dashboard");
        const { _id } = res.data.dashboardDuplicate;
        if (_id) {
          navigate(`/insight?dashboardId=${_id}`);
        }
      })
      .catch((err) => {
        Alert.error(err.message);
      });
  };

  const dashboardRemove = (id: string) => {
    confirm(__("Are you sure to delete selected dashboard?")).then(() => {
      dashboardRemoveMutation({ variables: { id } })
        .then(() => {
          if (queryParams.dashboardId === id) {
            router.removeParams(
              navigate,
              location,
              ...Object.keys(queryParams)
            );
          }
          Alert.success(__("Successfully deleted a dashboard"));
        })
        .catch((e: Error) => Alert.error(e.message));
    });
  };

  const [dashboardChartsEditMutation] = useMutation(gql(mutations.chartsEdit), {
    refetchQueries: ['dashboardDetail']
  });

  const [dashboardChartsRemoveMutation] = useMutation(
    gql(mutations.chartsRemove),
    {
      refetchQueries: ["dashboards", "dashboardDetail", "insightPinnedList"],
    }
  );

  const [chartDuplicateMutation] = useMutation(
    gql(mutations.chartDuplicate),
    {
      refetchQueries: ["dashboards", "dashboardDetail", "insightPinnedList"],
    }
  );

  const chartDuplicate = (_id: string) => {
    chartDuplicateMutation({ variables: { _id } })
      .then((res) => {
        Alert.success("Successfully duplicated a chart");
      })
      .catch((err) => {
        Alert.error(err.message);
      });
  };

  const dashboardChartsEdit = (_id: string, values: any) => {
    dashboardChartsEditMutation({ variables: { _id, ...values } });
  };

  const dashboardChartsRemove = (_id: string) => {
    dashboardChartsRemoveMutation({ variables: { _id } })
      .then(() => {
        Alert.success("Successfully removed chart");
      })
      .catch((err) => Alert.error(err.message));
  };

  const dashboard =
    dashboardDetailQuery?.data?.dashboardDetail || ({} as IDashboard);
  const loading = dashboardDetailQuery.loading;

  const updatedProps = {
    ...props,
    dashboard,
    loading,
    dashboardDuplicate,
    dashboardRemove,
    dashboardChartsEdit,
    dashboardChartsRemove,
    chartDuplicate
  };

  return <Dashboard {...updatedProps} />;
};

export default DashboardContainer;