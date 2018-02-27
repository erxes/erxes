import React from 'react';
import PropTypes from 'prop-types';

function NotFound({ __ }) {
  return (
    <div className="auth-content">
      <div className="container">
        <div className="col-md-7">
          <div className="auth-description not-found">
            <img src="/images/logo.png" alt="erxes" />
            <h1>{__('404. This page is not found.')}</h1>
            <p>
              {__(
                'erxes is an open-source messaging platform for customer success'
              )}
            </p>
            <a href="http://erxes.io/">« Go to home page</a>
          </div>
        </div>
      </div>
    </div>
  );
}

NotFound.contextTypes = {
  __: PropTypes.func
};

export default NotFound;
