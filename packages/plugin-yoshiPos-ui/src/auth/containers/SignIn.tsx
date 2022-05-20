import apolloClient from '../../../apolloClient';
import { __ } from '../..//common/utils';
import React from 'react';
import { withRouter } from 'react-router-dom';
import ButtonMutate from '../../common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps, IConfig } from '../../types';
import SignIn from '../components/SignIn';
import { mutations } from '../graphql';
import withCurrentUser from './withCurrentUser';

type Props = {
  currentConfig: IConfig;
} & IRouterProps;

const SignInContainer = (props: Props) => {
  const { history } = props;

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    const callbackResponse = () => {
      apolloClient.resetStore();

      history.push('/?signedIn=true');

      window.location.reload();
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

export default withCurrentUser(withRouter(SignInContainer));
