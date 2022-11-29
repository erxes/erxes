import { EmptyState, Spinner, withProps } from '@erxes/ui/src';
import React from 'react';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import FormHistoryComponent from '../components/FormHistory';

type Props = {
  riskAssessmentId: string;
};

type FinalProps = {
  riskAssessmentHistory: any;
} & Props;

class FormHistory extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { riskAssessmentHistory } = this.props;

    const { loading, error, riskFormSubmitHistory } = riskAssessmentHistory;

    if (loading) {
      return <Spinner />;
    }

    if(error){

      const errorMessage = error.message.replace('GraphQL error:','')

      return <EmptyState text={errorMessage} image="/images/actions/25.svg" />;
    }

    return <FormHistoryComponent detail={riskFormSubmitHistory || []} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.assessmentHistory), {
      name: 'riskAssessmentHistory',
      options: ({ riskAssessmentId }) => ({
        variables: { riskAssessmentId }
      })
    })
  )(FormHistory)
);
