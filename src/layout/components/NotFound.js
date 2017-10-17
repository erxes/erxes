import React from 'react';

function NotFound() {
  return (
    <div className="auth-content">
      <div className="container">
        <div className="col-md-7">
          <div className="auth-description not-found">
            <img src="/images/logo.png" alt="erxes" />
            <h1>404. This page is not found.</h1>
            <p>
              erxes is an open-source messaging platform for customer success
            </p>
            <a href="http://erxes.io/">« Go to home page</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
