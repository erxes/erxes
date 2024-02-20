import React from 'react';
import { withRouter } from 'react-router-dom';

import apolloClient from 'apolloClient';
import { __ } from 'modules/common/utils';

import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import SignIn from '../components/SignIn';
import { mutations } from '../graphql';
import withCurrentOrganization from '@erxes/ui-settings/src/general/saas/containers/withCurrentOrganization';
import ButtonMutate from '../../../common/components/ButtonMutate';

type FinalProps = {
  currentOrganization: any;
} & IRouterProps;

const SignInContainer = (props: FinalProps) => {
  const { history, currentOrganization, location } = props;

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callbackResponse = () => {
      apolloClient.resetStore();

      history.push(
        (!location.pathname.includes('sign-in') &&
          `${location.pathname}${location.search}`) ||
          '/?signedIn=true',
      );

      window.location.reload();
    };

    return (
      <ButtonMutate
        mutation={mutations.login}
        variables={values}
        callback={callbackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        btnStyle="default"
        block={true}
        icon="none"
        style={{ background: `${currentOrganization.backgroundColor}` }}
      >
        {__('Sign in')}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
  };

  return <SignIn {...updatedProps} />;
};

export default withRouter<IRouterProps>(
  withCurrentOrganization(SignInContainer),
);
