import { EmptyState, Spinner } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { IndicatorAssessmentsQueryResponse } from '../../common/types';
import AssessmentHistoryComponent from '../components/IndicatorAssessmentHistory';
import { queries } from '../graphql';

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

    const {
      indicatorsAssessmentHistory,
      loading,
      error
    } = assessmentHistoryQueryResponse;

    if (loading) {
      return <Spinner />;
    }

    if (error) {
      <EmptyState text={error} />;
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
      name: 'assessmentHistoryQueryResponse',
      skip: ({ indicatorId }) => !indicatorId,
      options: ({ indicatorId, branchId, departmentId, operationId }) => ({
        variables: {
          indicatorId,
          branchId,
          departmentId,
          operationId
        }
      })
    })
  )(AssessmentHistory)
);
