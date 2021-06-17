import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import { IUser } from 'modules/auth/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import TodoDetail from '../components/TodoDetail';
import { mutations, queries, subscriptions } from '../graphql';
import {
  CompleteShowStepMutationResponse,
  IFeature,
  StepsCompletenessQueryResponse
} from '../types';

type Props = {
  feature: IFeature;
  currentRoute?: string;
};

type FinalProps = Props &
  CompleteShowStepMutationResponse & {
    stepsCompletenessQuery: StepsCompletenessQueryResponse;
    currentUser: IUser;
  };

class TodoDetailContainer extends React.Component<FinalProps> {
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
    const { completeShowStepMutation, feature } = this.props;
    completeShowStepMutation({ variables: { step: `${feature.name}Show` } });
  };

  render() {
    const { stepsCompletenessQuery, currentRoute } = this.props;

    const updatedProps = {
      ...this.props,
      completeShowStep: this.completeShowStep,
      stepsCompleteness:
        stepsCompletenessQuery.onboardingStepsCompleteness || {}
    };

    if (currentRoute === 'todoDetail') {
      return <TodoDetail {...updatedProps} />;
    }

    /* if (currentRoute === "setupDetail") {
      return <SetupDetail {...updatedProps} />;
    } */

    return null;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.stepsCompleteness), {
      name: 'stepsCompletenessQuery',
      options: ({ feature }) => {
        return {
          variables: {
            steps: feature.settings
          }
        };
      }
    }),
    graphql<{}>(gql(mutations.completeShowStep), {
      name: 'completeShowStepMutation'
    })
  )(withCurrentUser(TodoDetailContainer))
);
