import React from 'react';

import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { Alert } from 'modules/common/utils';
import { OnBoardingMutationResponse } from 'modules/saas/onBoarding/types';
import { mutations } from 'modules/saas/onBoarding/graphql';
import OnBoardingDone from '../components/OnBoardingDone';

type Props = {};

type FinalProps = {} & Props & OnBoardingMutationResponse;

function OnBoardingDoneContainer(props: FinalProps) {
  const { organizationOnboardingDone } = props;

  const submit = () => {
    organizationOnboardingDone({
      variables: {},
    })
      .then(() => {
        Alert.success('First step is done');
        window.location.href = '/';
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    submit,
  };

  return <OnBoardingDone {...updatedProps} />;
}

export default compose(
  graphql<Props, OnBoardingMutationResponse, {}>(
    gql(mutations.organizationOnboardingDone),
    {
      name: 'organizationOnboardingDone',
    },
  ),
)(OnBoardingDoneContainer);
