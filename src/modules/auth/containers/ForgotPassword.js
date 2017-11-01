import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql, gql } from 'react-apollo';
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
        console.log(error); // eslint-disable-line
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
