import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql, gql } from 'react-apollo';
import { SignIn } from '../components';
import { mutations } from '../graphql';

const SignInContainer = props => {
  const { loginMutation } = props;

  const login = variables => {
    loginMutation({ variables })
      .then(({ data }) => {
        const { token, refreshToken } = data.login;

        localStorage.setItem('erxesLoginToken', token);
        localStorage.setItem('erxesLoginRefreshToken', refreshToken);
      })
      .catch(error => {
        console.log(error); // eslint-disable-line
      });
  };

  const updatedProps = {
    ...props,
    login
  };

  return <SignIn {...updatedProps} />;
};

SignInContainer.propTypes = {
  loginMutation: PropTypes.func
};

export default compose(
  graphql(gql(mutations.login), {
    name: 'loginMutation'
  })
)(SignInContainer);
