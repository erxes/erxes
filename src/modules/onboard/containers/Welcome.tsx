import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { Welcome } from '../components';
import { mutations } from '../graphql';
import { UserSeenOnboardMutationResponse } from '../types';

type Props = { hasSeen: boolean };

type FinalProps = Props & UserSeenOnboardMutationResponse;

const WelcomeContainer = (props: ChildProps<FinalProps>) => {
  const { userSeenOnboardMutation } = props;

  // set seen onboard
  const seenOnboard = (callback: () => void) => {
    userSeenOnboardMutation()
      .then(() => {
        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    seenOnboard
  };

  return <Welcome {...updatedProps} />;
};

export default compose(
  graphql<UserSeenOnboardMutationResponse>(gql(mutations.userSeenOnboard), {
    name: 'userSeenOnboardMutation'
  })
)(WelcomeContainer);
