import React from 'react';
import { compose } from 'react-apollo';
import { ForgotPassword } from '../components';

const ForgotPasswordContainer = props => {
  // TODO
  const forgotPassword = () => {};

  const updatedProps = {
    ...props,
    forgotPassword
  };

  return <ForgotPassword {...updatedProps} />;
};

export default compose()(ForgotPasswordContainer);
