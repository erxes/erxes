import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import { IUser } from 'modules/auth/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import SetupDetail from '../components/SetupDetail';
import { mutations, queries, subscriptions } from '../graphql';
import {
  CompleteShowStepMutationResponse,
  IFeature,
  StepsCompletenessQueryResponse
} from '../types';

type Props = {
  roleOption: IFeature;
};

type FinalProps = Props &
  CompleteShowStepMutationResponse & {
    stepsCompletenessQuery: StepsCompletenessQueryResponse;
    currentUser: IUser;
  };

class SetupDetailContainer extends React.Component<FinalProps> {
  componentWillMount() {
    const { stepsCompletenessQuery, currentUser } = this.props;

    stepsCompletenessQuery.subscribeToMore({
      document: gql(subscriptions.onboardingChanged),
      variables: { userId: currentUser._id },
      updateQuery: (prev, { subscriptionData: { data } }) => {
        stepsCompletenessQuery.refetch();
      }
    });
  }

  completeShowStep = () => {
    const { completeShowStepMutation, roleOption } = this.props;
    completeShowStepMutation({ variables: { step: `${roleOption.name}Show` } });
  };

  render() {
    const { stepsCompletenessQuery } = this.props;

    const updatedProps = {
      ...this.props,
      completeShowStep: this.completeShowStep,
      stepsCompleteness:
        stepsCompletenessQuery.onboardingStepsCompleteness || {}
    };

    return <SetupDetail {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.stepsCompleteness), {
      name: 'stepsCompletenessQuery',
      options: ({ roleOption }) => {
        return {
          variables: {
            steps: roleOption.settings
          }
        };
      }
    }),
    graphql<{}>(gql(mutations.completeShowStep), {
      name: 'completeShowStepMutation'
    })
  )(withCurrentUser(SetupDetailContainer))
);
