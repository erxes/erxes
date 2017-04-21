import React from 'react';
import PropTypes from 'prop-types';
import AlertContainer from '../../common/alert/containers/AlertContainer';

const propTypes = {
  content: PropTypes.element,
};

function AuthLayout({ content }) {
  return (
    <div className="auth-layout">
      {content}
      <AlertContainer />
    </div>
  );
}

AuthLayout.propTypes = propTypes;

export default AuthLayout;
