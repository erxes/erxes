import * as React from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { ResetPassword } from '../components';
import { mutations } from '../graphql';

const ResetPasswordContainer = props => {
  const { resetPasswordMutation, history, token } = props;

  const resetPassword = newPassword => {
    resetPasswordMutation({
      variables: {
        newPassword,
        token
      }
    })
      .then(() => {
        history.push('/sign-in');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    resetPassword
  };

  return <ResetPassword {...updatedProps} />;
};

ResetPasswordContainer.propTypes = {
  token: PropTypes.string,
  resetPasswordMutation: PropTypes.func,
  history: PropTypes.object
};

export default withRouter(
  compose(
    graphql(gql(mutations.resetPassword), {
      name: 'resetPasswordMutation'
    })
  )(ResetPasswordContainer)
);
