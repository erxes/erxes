import { IUser } from 'modules/auth/types';
import React from 'react';
import { queries } from 'modules/saas/onBoarding/graphql';
import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import OnBoarding from '../components/OnBoarding';
import { UserDetailQueryResponse } from '@erxes/ui/src/team/types';
import { IntegrationsQueryResponse } from '../types';

type Props = {
  currentUser: IUser;
  onBoardingStepsQuery: any;
  queryParams: any;
};

type FinalProps = {
  userDetailQuery: UserDetailQueryResponse;
  integrationsQuery: IntegrationsQueryResponse;
} & Props;

function OnBoardingContainer(props: FinalProps) {
  const { onBoardingStepsQuery, userDetailQuery, integrationsQuery } = props;

  if (userDetailQuery.loading) {
    return null;
  }

  if (integrationsQuery.loading) {
    return null;
  }

  if (onBoardingStepsQuery.loading) {
    return null;
  }

  const integrations = integrationsQuery.integrations || [];

  const updatedProps = {
    ...props,
    onboardingSteps: onBoardingStepsQuery
      ? onBoardingStepsQuery.getOnboardingSteps || []
      : [],
    user: userDetailQuery.userDetail || ({} as IUser),
    integration: integrations && integrations[0],
  };

  return <OnBoarding {...updatedProps} />;
}

export default compose(
  graphql<Props>(gql(queries.getOnboardingSteps), {
    name: 'onBoardingStepsQuery',
  }),
  graphql<Props, UserDetailQueryResponse, {}>(gql(queries.userDetail), {
    name: 'userDetailQuery',
    options: ({ currentUser }) => ({
      variables: {
        _id: currentUser && currentUser._id,
      },
    }),
  }),
  graphql<Props, IntegrationsQueryResponse>(gql(queries.integrations), {
    name: 'integrationsQuery',
    options: () => {
      return {
        variables: { kind: 'messenger' },
        pollInterval: 5000,
      };
    },
  }),
)(OnBoardingContainer);
