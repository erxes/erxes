import React from "react";

import Alert from "@erxes/ui/src/utils/Alert/index";
import Spinner from "@erxes/ui/src/components/Spinner";
import { __ } from "@erxes/ui/src/utils/index";

import Form from "../../components/dashboard/Form";
import { queries, mutations } from "../../graphql";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  DashboardDetailQueryResponse,
  DashboardEditMutationResponse,
  DashboardFormMutationVariables,
  InsightTemplatesListQueryResponse,
} from "../../types";
import { useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;

  dashboardId?: string;

  closeDrawer: () => void;
};

const FormContainer = (props: Props) => {
  const { dashboardId, closeDrawer } = props;
  const navigate = useNavigate();

  const dashboardDetailQuery = useQuery<DashboardDetailQueryResponse>(
    gql(queries.dashboardDetail),
    {
      skip: !dashboardId,
      variables: { id: dashboardId },
    }
  );

  const reportTemplatesListQuery = useQuery<InsightTemplatesListQueryResponse>(
    gql(queries.insightTemplatesList)
  );

  const [dashboardAddMutation] = useMutation(gql(mutations.dashboardAdd), {
    refetchQueries: [
      {
        query: gql(queries.sectionList),
        variables: { type: "dashboard" },
      },
      {
        query: gql(queries.dashboardList),
      },
    ],
  });

  const [dashboardEditMutation] = useMutation<DashboardEditMutationResponse>(
    gql(mutations.dashboardEdit),
    {
      refetchQueries: [
        {
          query: gql(queries.sectionList),
          variables: { type: "dashboard" },
        },
        {
          query: gql(queries.dashboardList),
        },
        {
          query: gql(queries.dashboardDetail),
          variables: {
            id: dashboardId,
          },
        },
        {
          query: gql(queries.insightPinnedList),
        },
      ],
    }
  );

  const handleMutation = (values: DashboardFormMutationVariables) => {
    if (dashboardId) {
      return dashboardEditMutation({
        variables: { _id: dashboardId, ...values },
      })
        .then(() => {
          closeDrawer();

          Alert.success("Successfully edited dashboard");
          navigate(`/insight?dashboardId=${dashboardId}`);
        })
        .catch((err) => Alert.error(err.message));
    }

    dashboardAddMutation({ variables: { ...values } })
      .then((res) => {
        closeDrawer();

        Alert.success("Successfully created dashboard");
        const { _id } = res.data.dashboardAdd;
        if (_id) {
          navigate(`/insight?dashboardId=${_id}`);
        }
      })
      .catch((err) => {
        Alert.error(err.message);
      });
  };

  if (dashboardDetailQuery.loading) {
    return <Spinner />;
  }

  const dashboard = dashboardDetailQuery?.data?.dashboardDetail;
  const loading = dashboardDetailQuery.loading;
  const reportTemplates =
    reportTemplatesListQuery?.data?.insightTemplatesList || [];

  const updatedProps = {
    ...props,
    dashboard,
    loading,
    reportTemplates,

    handleMutation,
  };
  return <Form {...updatedProps} />;
};

export default FormContainer;
