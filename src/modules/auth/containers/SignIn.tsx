import apolloClient from 'apolloClient';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { withRouter } from 'react-router';
import { ButtonMutate } from '../../common/components';
import { IButtonMutateProps, IRouterProps } from '../../common/types';
import { SignIn } from '../components';
import { mutations } from '../graphql';

const SignInContainer = (props: IRouterProps) => {
  const { history } = props;

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callbackResponse = () => {
      apolloClient.resetStore();
      history.push('/');
    };

    return (
      <ButtonMutate
        mutation={mutations.login}
        variables={values}
        callback={callbackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        block={true}
        icon="none"
      >
        {__('Sign in')}
      </ButtonMutate>
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <SignIn {...updatedProps} />;
};

export default withRouter<IRouterProps>(SignInContainer);
