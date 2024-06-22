import { gql, useQuery } from "@apollo/client";

import { Description } from "@erxes/ui-settings/src/styles";
import { FormContainer } from "../../styles";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import { Box as StatusBox } from "../../styles";
import { __ } from "@erxes/ui/src/utils/core";
import { generateParams } from "./List";
import queries from "../graphql/queries";

export function Statistics({
  queryParams,
  totalCount,
}: {
  queryParams: any;
  totalCount: number;
}) {
  const { data, loading } = useQuery(gql(queries.getStatistic), {
    variables: {
      ...generateParams({ queryParams }),
    },
  });

  if (loading) {
    return <Spinner objective />;
  }

  const { averageScore, submittedAssessmentCount } =
    data?.riskAssessmentStatistics || {};

  const list = [
    {
      label: "Total count",
      value: totalCount || 0,
    },
    {
      label: "Average Score",
      value: averageScore || 0,
    },
    {
      label: "Submitted Assessments Count",
      value: submittedAssessmentCount || 0,
    },
  ];

  return (
    <FormContainer $column>
      {list.map((item, i) => (
        <StatusBox key={i}>
          <Description>{__(item.label)}</Description>
          <h4>{item.value}</h4>
        </StatusBox>
      ))}
    </FormContainer>
  );
}
