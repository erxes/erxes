import React from 'react';
import { compose } from 'react-apollo';
import { ResetPassword } from '../components';

const ResetPasswordContainer = props => {
  // TODO
  const resetPassword = () => {};

  const updatedProps = {
    ...props,
    resetPassword
  };

  return <ResetPassword {...updatedProps} />;
};

export default compose()(ResetPasswordContainer);
