import apolloClient from 'apolloClient';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import React from 'react';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';

import { Alert, __ } from 'modules/common/utils';

import ButtonMutate from '../../../common/components/ButtonMutate';
import SignInWithEmail from '../components/SignInWithEmail';
import { mutations } from '../graphql';
import withCurrentOrganization from '@erxes/ui-settings/src/general/saas/containers/withCurrentOrganization';

type Props = {
  loginWithGoogle: () => Promise<any>;
  currentOrganization: any;
};

type FinalProps = Props & IRouterProps;

const SignInWithEmailContainer = (props: FinalProps) => {
  const { loginWithGoogle, currentOrganization } = props;

  const loginViaGoogle = () => {
    loginWithGoogle()
      .then(({ data }) => {
        if (data && data.loginWithGoogle) {
          window.location.href = data.loginWithGoogle;
        }
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callbackResponse = () => {
      apolloClient.resetStore();
    };

    return (
      <ButtonMutate
        mutation={mutations.loginWithMagicLink}
        variables={values}
        callback={callbackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        btnStyle="default"
        block={true}
        icon="none"
        successMessage="We have sent an email containing the magic link to sign in."
        style={{ background: `${currentOrganization.backgroundColor}` }}
      >
        {__('Send magic link')}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
    loginViaGoogle,
  };

  return <SignInWithEmail {...updatedProps} />;
};

export default compose(
  graphql(gql(mutations.loginWithGoogle), {
    name: 'loginWithGoogle',
  }),
)(withCurrentOrganization(SignInWithEmailContainer));
