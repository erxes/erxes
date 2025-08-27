import React from "react";
import * as compose from 'lodash.flowright';
import { gql, useQuery, useMutation } from "@apollo/client";

import Alert from "@erxes/ui/src/utils/Alert/index";
import confirm from "@erxes/ui/src/utils/confirmation/confirm";
import { __ } from "@erxes/ui/src/utils/index";
import { router } from "@erxes/ui/src/utils";

import DashboardSection from "../../components/section/Dashboard";
import { queries, mutations } from "../../graphql";
import {
  DashboardsListQueryResponse,
  SectionsListQueryResponse,
} from "../../types";
import { useLocation, useNavigate } from "react-router-dom";
import { IUser } from "@erxes/ui/src/auth/types";
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';

type Props = {
  queryParams: any;
};

type FinalProps = {
  currentUser: IUser
} & Props

const DashboardSectionContainer = (props: FinalProps) => {
  const { queryParams, currentUser } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const dashboardsQuery = useQuery<DashboardsListQueryResponse>(
    gql(queries.dashboardList)
  );
  const sectionsQuery = useQuery<SectionsListQueryResponse>(
    gql(queries.sectionList),
    {
      variables: {
        type: "dashboard",
      },
    }
  );

  const [dashboardUpdate] = useMutation(gql(mutations.dashboardEdit), {
    refetchQueries: [
      {
        query: gql(queries.sectionList),
        variables: { type: "dashboard" },
      },
      {
        query: gql(queries.dashboardList),
      },
      {
        query: gql(queries.insightPinnedList),
      },
    ],
  });

  const [dashboardRemove] = useMutation(gql(mutations.dashboardRemove), {
    refetchQueries: [
      {
        query: gql(queries.sectionList),
        variables: { type: "dashboard" },
      },
      {
        query: gql(queries.dashboardList),
      },
      {
        query: gql(queries.insightPinnedList),
      },
    ],
  });

  const updateDashboard = (_id: string) => {
    dashboardUpdate({
      variables: { _id, userId: currentUser._id },
    })
  };

  const removeDashboard = (id: string) => {
    confirm(__("Are you sure to delete selected dashboard?")).then(() => {
      dashboardRemove({
        variables: { id },
      })
        .then(() => {
          if (queryParams.dashboardId === id) {
            router.removeParams(
              navigate,
              location,
              ...Object.keys(queryParams)
            );
          }
          Alert.success("You successfully deleted a dashboard");
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const sections = sectionsQuery?.data?.sections || [];
  const { list = [], totalCount = 0 } =
    dashboardsQuery?.data?.dashboardList || {};
  const loading = dashboardsQuery.loading && sectionsQuery.loading;

  const updatedProps = {
    ...props,
    sections,
    dashboards: list,
    loading,
    updateDashboard,
    removeDashboard,
  };

  return <DashboardSection {...updatedProps} />;
};

export default compose(withCurrentUser(DashboardSectionContainer))
