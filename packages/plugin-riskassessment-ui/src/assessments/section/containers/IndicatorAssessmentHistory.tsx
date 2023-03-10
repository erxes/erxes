import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils/core';
import { queries } from '../graphql';
import { IndicatorAssessmentsQueryResponse } from '../../common/types';
import { EmptyState, Spinner } from '@erxes/ui/src';
import AssessmentHistoryComponent from '../components/IndicatorAssessmentHistory';

type Props = {
  indicatorId: string;
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
      options: ({ indicatorId }) => ({
        variables: {
          indicatorId
        }
      })
    })
  )(AssessmentHistory)
);
