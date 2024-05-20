import React from "react";

import { gql, useQuery, useMutation } from "@apollo/client";

import Alert from "@erxes/ui/src/utils/Alert/index";

import SelectDashboard from "../../components/utils/SelectDashboard";
import { IReport, SectionsListQueryResponse } from "../../types";
import { queries, mutations } from "../../graphql";
import { useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  data: IReport;
};

const SelectDashboardContainer = (props: Props) => {
  const { queryParams, data } = props;
  const navigate = useNavigate();

  const sectionsQuery = useQuery<SectionsListQueryResponse>(
    gql(queries.sectionList),
    {
      variables: { type: "dashboard" },
    }
  );

  const [dashboardAddToMutation] = useMutation(gql(mutations.dashboardAddTo), {
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

  const handleMutation = (id: string) => {
    dashboardAddToMutation({
      variables: {
        ...data,
        serviceNames: [data.serviceName],
        serviceTypes: [data.serviceType],
        sectionId: id,
      },
    })
      .then((res) => {
        Alert.success("Successfully added to dashboard");
        const { _id } = res.data.dashboardAddTo;
        if (_id) {
          navigate(`/insight?dashboardId=${_id}`);
        }
      })
      .catch((err) => {
        Alert.error(err.message);
      });
  };

  const sections = sectionsQuery?.data?.sections || [];

  const updatedProps = {
    ...props,
    sections,
    handleMutation,
  };

  return <SelectDashboard {...updatedProps} />;
};

export default SelectDashboardContainer;
