import * as compose from "lodash.flowright";

import { gql, useQuery } from "@apollo/client";

import { Error } from "@erxes/ui/src/components/form/styles";
import ErrorBoundary from "@erxes/ui/src/components/ErrorBoundary";
import React from "react";
// import { graphql } from '@apollo/client/react/hoc';
import { RiskAssessmentQueryResponse } from "../../common/types";
import SectionComponent from "../components/Section";
import { Spinner } from "@erxes/ui/src";
import { queries } from "../graphql";
import { withProps } from "@erxes/ui/src/utils/core";

type Props = {
  queryParams: any;
  mainTypeId: string;
  mainType: string;
  showType?: string;
};

function Section({ mainType, mainTypeId, showType }: Props) {
  const { data, loading, error } = useQuery(gql(queries.riskAssessment), {
    variables: { cardType: mainType, cardId: mainTypeId },
    skip: !mainTypeId,
  });

  if (loading) {
    return <Spinner />;
  }

  // if (error) {
  //   return <Error>{error.message}</Error>;
  // }

  const { riskAssessment } = data || {};

  const updatedProps = {
    riskAssessments: riskAssessment,
    cardType: mainType,
    cardId: mainTypeId,
    showType,
  };

  return (
    <ErrorBoundary error={error} pluginName="RiskAssessment">
      <SectionComponent {...updatedProps} />;
    </ErrorBoundary>
  );
}
export default Section;
