import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import { IUser } from 'modules/auth/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../common/utils';
import Welcome from '../components/Welcome';
import { queries, subscriptions } from '../graphql';

type Props = {
  stepsCompletenessQuery: any;
  currentUser: IUser;
};

class WelcomeContainer extends React.Component<Props> {
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

  render() {
    const { stepsCompletenessQuery, currentUser } = this.props;

    return <Welcome currentUser={currentUser} />;
  }
}

export default withCurrentUser(WelcomeContainer);
