import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  content: PropTypes.element
};

function AuthLayout({ content }) {
  return (
    <div className="auth-layout">
      <div className="auth-content">
        <div className="container">
          <div className="col-md-7">
            <div className="auth-description">
              <img src="/images/logo.png" alt="erxes" />
              <h1>Customer engagement. Redefined.</h1>
              <p>
                erxes is an AI meets open source messaging platform for sales
                and marketing teams.
              </p>
              <a href="http://erxes.io/">« Go to home page</a>
            </div>
          </div>
          <div className="col-md-5">{content}</div>
        </div>
      </div>
    </div>
  );
}

AuthLayout.propTypes = propTypes;

export default AuthLayout;
