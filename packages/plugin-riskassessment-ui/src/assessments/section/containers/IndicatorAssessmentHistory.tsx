import * as compose from "lodash.flowright";

import { EmptyState, Spinner } from "@erxes/ui/src";

import AssessmentHistoryComponent from "../components/IndicatorAssessmentHistory";
import { IndicatorAssessmentsQueryResponse } from "../../common/types";
import React from "react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { queries } from "../graphql";
import { withProps } from "@erxes/ui/src/utils/core";

type Props = {
  indicatorId: string;
  branchId?: string;
  departmentId?: string;
  operationId?: string;
  setHistory: (submission: any) => void;
};

type FinalProps = {
  assessmentHistoryQueryResponse: IndicatorAssessmentsQueryResponse;
} & Props;

class AssessmentHistory extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { assessmentHistoryQueryResponse, setHistory } = this.props;

    const { indicatorsAssessmentHistory, loading, error } =
      assessmentHistoryQueryResponse;

    if (loading) {
      return <Spinner />;
    }

    return (
      <AssessmentHistoryComponent
        assessmentsHistory={indicatorsAssessmentHistory}
        setHistory={setHistory}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.indicatorAssessments), {
      name: "assessmentHistoryQueryResponse",
      skip: ({ indicatorId }) => !indicatorId,
      options: ({ indicatorId, branchId, departmentId, operationId }) => ({
        variables: {
          indicatorId,
          branchId,
          departmentId,
          operationId,
        },
      }),
    })
  )(AssessmentHistory)
);
