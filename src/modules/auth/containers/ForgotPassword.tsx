import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ForgotPassword } from '../components';
import { mutations } from '../graphql';

type Props = {
  // TODO: replace any
  forgotPasswordMutation: (params: { variables: any }) => any;
  history: any;
};

const ForgotPasswordContainer = (props: Props) => {
  const { forgotPasswordMutation } = props;

  const forgotPassword = variables => {
    forgotPasswordMutation({ variables })
      .then(() => {
        Alert.success(
          'Further instructions have been sent to your e-mail address.'
        );
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

export default compose(
  graphql(gql(mutations.forgotPassword), {
    name: 'forgotPasswordMutation'
  })
)(ForgotPasswordContainer);
