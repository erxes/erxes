import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql, gql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { ForgotPassword } from '../components';
import { mutations } from '../graphql';

const ForgotPasswordContainer = props => {
  const { forgotPasswordMutation } = props;

  const forgotPassword = variables => {
    forgotPasswordMutation({ variables })
      .then(({ data: { forgotPassword } }) => {
        console.log(forgotPassword); // eslint-disable-line
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    forgotPassword
  };

  return <ForgotPassword {...updatedProps} />;
};

ForgotPasswordContainer.propTypes = {
  forgotPasswordMutation: PropTypes.func,
  history: PropTypes.object
};

export default compose(
  graphql(gql(mutations.forgotPassword), {
    name: 'forgotPasswordMutation'
  })
)(ForgotPasswordContainer);
